package com.jasongolda.lumieresdepoche;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

final class GemPackCatalog {
    static final class Pack {
        final String productId;
        final int gems;
        final String label;

        Pack(String productId, int gems, String label) {
            this.productId = productId;
            this.gems = gems;
            this.label = label;
        }
    }

    static final List<Pack> PACKS = Collections.unmodifiableList(Arrays.asList(
        new Pack("gems_120", 120, "Petite lueur"),
        new Pack("gems_650", 650, "Bocal lumineux"),
        new Pack("gems_1400", 1400, "Grande lanterne"),
        new Pack("gems_3000", 3000, "Réserve du refuge")
    ));

    private static final Map<String, Pack> BY_ID;

    static {
        Map<String, Pack> packs = new LinkedHashMap<>();
        for (Pack pack : PACKS) {
            packs.put(pack.productId, pack);
        }
        BY_ID = Collections.unmodifiableMap(packs);
    }


    static String localTestCatalogJson() {
        JSONArray products = new JSONArray();
        String[] prices = {"1,99 € simulé", "9,99 € simulé", "19,99 € simulé", "39,99 € simulé"};
        for (int index = 0; index < PACKS.size(); index++) {
            Pack pack = PACKS.get(index);
            JSONObject item = new JSONObject();
            try {
                item.put("productId", pack.productId);
                item.put("gems", pack.gems);
                item.put("label", pack.label);
                item.put("available", true);
                item.put("price", prices[index]);
                item.put("title", pack.label);
                item.put("mock", true);
            }
            catch (JSONException ignored) {
            }
            products.put(item);
        }
        return products.toString();
    }

    private GemPackCatalog() {
    }

    static Pack find(String productId) {
        return BY_ID.get(productId);
    }
}
