"""Checks that the offline QA runner reports actionable tool errors."""
import unittest
from unittest.mock import patch

from tools import qa


class QaRunnerTests(unittest.TestCase):
    def setUp(self):
        qa.ERRORS.clear()

    def tearDown(self):
        qa.ERRORS.clear()

    def test_missing_node_is_reported_without_traceback(self):
        with patch.object(qa.subprocess, "run", side_effect=FileNotFoundError("node not found")):
            qa.run(["node", "--check", "example.js"])
        self.assertEqual(len(qa.ERRORS), 1)
        self.assertIn("node", qa.ERRORS[0])

    def test_nonzero_exit_is_reported(self):
        class Result:
            returncode = 1
            stdout = ""
            stderr = "syntax error"
        with patch.object(qa.subprocess, "run", return_value=Result()):
            qa.run(["node", "--check", "broken.js"])
        self.assertIn("syntax error", qa.ERRORS[0])


if __name__ == "__main__":
    unittest.main()
