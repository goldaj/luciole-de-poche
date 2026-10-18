#!/usr/bin/env python3
"""Build the temporary phone-test APK without an Android SDK.

This builder is deliberately separate from the Play Store pipeline. It reuses the tiny
historical WebView shell, replaces its web assets with the current game, injects the
local test bridge, updates version metadata, and signs with the historical certificate.
It must never be used for a Play Store artifact.
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
import struct
import subprocess
import zlib
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

EXPECTED_SHA256 = "48:B2:C8:07:72:AD:F4:8A:7C:A4:9D:A7:58:DF:FE:6F:0B:88:DB:E9:5D:9E:CC:12:29:AA:5D:C9:FA:35:46:F4"
DEV_SCRIPT_TAG = '  <script src="js/dev-local-bridge.js"></script>\n'


def patch_manifest(data: bytes, *, old_version: str, new_version: str, old_code: int, new_code: int) -> bytes:
    if len(old_version.encode("utf-8")) != len(new_version.encode("utf-8")):
        raise ValueError("Le versionName temporaire doit conserver la même longueur UTF-8 que la base.")

    patched = bytearray(data)
    old = old_version.encode("utf-8")
    new = new_version.encode("utf-8")
    position = patched.find(old)
    if position < 0:
        raise ValueError("versionName source introuvable dans le manifeste binaire.")
    patched[position : position + len(old)] = new

    code_marker = b"\x08\x00\x00\x10" + struct.pack("<I", old_code)
    position = patched.find(code_marker)
    if position < 0:
        raise ValueError("versionCode source introuvable dans le manifeste binaire.")
    patched[position + 4 : position + 8] = struct.pack("<I", new_code)

    # The historical AXML string pool is patched in place. Padding is intentional so
    # we do not rewrite the binary XML string table just for this temporary APK shell.
    old_label = "Lumières de poche".encode("utf-8")
    new_label = "Luciole de poche\u00a0".encode("utf-8")
    label_position = patched.find(old_label)
    if label_position >= 0:
        if len(new_label) != len(old_label):
            raise ValueError("Le libellé temporaire doit conserver exactement la taille UTF-8 du libellé historique.")
        patched[label_position : label_position + len(old_label)] = new_label

    return bytes(patched)



def patch_dex_entrypoint(data: bytes) -> bytes:
    old = b"file:///android_asset/index.html"
    new = b"file:///android_asset/b133x.html"
    if len(old) != len(new):
        raise ValueError("Le point d’entrée DEX doit conserver exactement la même taille.")
    patched = bytearray(data)
    position = patched.find(old)
    if position < 0:
        raise ValueError("URL d’entrée WebView introuvable dans classes.dex.")
    patched[position:position + len(old)] = new

    # DEX header: signature SHA-1 over bytes[32:], then Adler32 over bytes[12:].
    patched[12:32] = hashlib.sha1(patched[32:]).digest()
    patched[8:12] = struct.pack("<I", zlib.adler32(patched[12:]) & 0xFFFFFFFF)
    return bytes(patched)

def clone_info(info: ZipInfo) -> ZipInfo:
    cloned = ZipInfo(info.filename, info.date_time)
    cloned.compress_type = info.compress_type
    cloned.comment = info.comment
    cloned.extra = info.extra
    cloned.create_system = info.create_system
    cloned.create_version = info.create_version
    cloned.extract_version = info.extract_version
    cloned.flag_bits = info.flag_bits
    cloned.volume = info.volume
    cloned.internal_attr = info.internal_attr
    cloned.external_attr = info.external_attr
    return cloned


def current_assets(source: Path) -> dict[str, bytes]:
    root = source / "app" / "src" / "main" / "assets"
    replacements = {
        "assets/" + path.relative_to(root).as_posix(): path.read_bytes()
        for path in root.rglob("*")
        if path.is_file()
    }

    index_key = "assets/index.html"
    html = replacements[index_key].decode("utf-8")
    if "dev-local-bridge.js" in html:
        raise ValueError("Le bridge de test ne doit pas être référencé par les assets commerciaux.")
    marker = '  <script src="js/data.js"></script>\n'
    if marker not in html:
        raise ValueError("Point d'injection des scripts introuvable dans index.html.")
    replacements[index_key] = html.replace(marker, DEV_SCRIPT_TAG + marker, 1).encode("utf-8")
    # The phone-test shell opens a versioned document path to defeat persistent WebView caches.
    replacements["assets/b133x.html"] = replacements[index_key]

    dev_bridge = source / "tools" / "phone_test" / "dev-local-bridge.js"
    replacements["assets/js/dev-local-bridge.js"] = dev_bridge.read_bytes()
    return replacements


def build_unsigned(base_apk: Path, source: Path, output: Path) -> None:
    replacements = current_assets(source)
    with ZipFile(base_apk, "r") as source_apk, ZipFile(output, "w") as target_apk:
        for info in source_apk.infolist():
            upper = info.filename.upper()
            if upper.startswith("META-INF/"):
                continue
            if info.filename.startswith("assets/"):
                if info.filename not in replacements:
                    continue
                data = replacements.pop(info.filename)
            else:
                data = source_apk.read(info.filename)

            if info.filename == "AndroidManifest.xml":
                data = patch_manifest(
                    data,
                    old_version="3.2.7",
                    new_version="4.0.0",
                    old_code=105,
                    new_code=133,
                )
            elif info.filename == "classes.dex":
                data = patch_dex_entrypoint(data)
            target_apk.writestr(clone_info(info), data)

        for name, data in replacements.items():
            info = ZipInfo(name)
            info.compress_type = ZIP_DEFLATED
            target_apk.writestr(info, data)


def sign(unsigned: Path, signed: Path, *, keystore: Path, alias: str, storepass: str, keypass: str) -> None:
    shutil.copy2(unsigned, signed)
    subprocess.run(
        [
            "jarsigner",
            "-keystore", str(keystore),
            "-storepass", storepass,
            "-keypass", keypass,
            "-sigalg", "SHA384withRSA",
            "-digestalg", "SHA-256",
            str(signed),
            alias,
        ],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    certificate = subprocess.run(
        ["keytool", "-printcert", "-jarfile", str(signed)],
        check=True,
        text=True,
        capture_output=True,
    ).stdout.upper().replace(" ", "")
    expected = EXPECTED_SHA256.replace(":", "")
    if expected not in certificate.replace(":", ""):
        signed.unlink(missing_ok=True)
        raise RuntimeError("La signature ne correspond pas au certificat historique.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-apk", required=True, type=Path)
    parser.add_argument("--source", default=Path(__file__).resolve().parents[1], type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--keystore", required=True, type=Path)
    parser.add_argument("--alias", required=True)
    parser.add_argument("--storepass", required=True)
    parser.add_argument("--keypass", required=True)
    args = parser.parse_args()

    args.out.parent.mkdir(parents=True, exist_ok=True)
    unsigned = args.out.with_suffix(".unsigned.apk")
    build_unsigned(args.base_apk, args.source, unsigned)
    sign(
        unsigned,
        args.out,
        keystore=args.keystore,
        alias=args.alias,
        storepass=args.storepass,
        keypass=args.keypass,
    )
    unsigned.unlink(missing_ok=True)
    print(args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
