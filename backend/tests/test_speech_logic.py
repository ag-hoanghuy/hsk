"""Checks for the pure logic of the speaking assessment (no model, no audio needed).

Run inside the backend container:  docker compose exec backend python -m unittest discover -s tests -v
"""

import unittest

from app.speech import assess
from app.speech.reference import boundary_prior
from app.speech.syllables import similarity, syllables


def tones(text: str) -> list[int]:
    return [s.tone for s in syllables(text)]


class SyllableTests(unittest.TestCase):
    def test_basic_reading(self):
        s = syllables("你周末有什么打算？")
        self.assertEqual([x.hanzi for x in s], list("你周末有什么打算"))
        self.assertEqual([x.base for x in s], ["ni", "zhou", "mo", "you", "shen", "me", "da", "suan"])
        self.assertEqual(tones("你周末有什么打算"), [3, 1, 4, 3, 2, 0, 3, 4])

    def test_punctuation_and_other_scripts_are_ignored(self):
        self.assertEqual(len(syllables("A：我 想 buy 书。")), 3)

    def test_third_tone_sandhi(self):
        ni, hao = syllables("你好")
        self.assertEqual(ni.surface, {2, 3})  # 3-3: the first may be spoken as tone 2
        self.assertEqual(hao.surface, {3})

    def test_bu_and_yi_sandhi(self):
        bu = syllables("不是")[0]
        self.assertEqual(bu.surface, {2})  # 不 before a fourth tone
        yi = syllables("一起")[0]
        self.assertIn(4, yi.surface)  # 一 before a third tone

    def test_erhua_is_merged_not_counted(self):
        s = syllables("一会儿")
        self.assertEqual(len(s), 2)
        self.assertTrue(s[1].erhua)
        self.assertEqual(len(syllables("女儿")), 2)  # a real syllable (ér), not erhua

    def test_character_positions(self):
        s = syllables("A：我想书")
        self.assertEqual([x.pos for x in s], [2, 3, 4])

    def test_similarity(self):
        self.assertEqual(similarity("shi", "shi"), 1.0)
        self.assertEqual(similarity("zhi", "zi"), 0.8)
        self.assertEqual(similarity("shi", "shu"), 0.5)
        self.assertEqual(similarity("ma", "tou"), 0.0)

    def test_word_timing_prior(self):
        words = [{"text": "你", "start": 0.1, "dur": 0.15}, {"text": "周末", "start": 0.25, "dur": 0.4}, {"text": "好", "start": 0.7, "dur": 0.1}]
        times, edges = boundary_prior(words, 4)
        self.assertEqual(len(times), 3)
        self.assertEqual(edges, [0, 2])  # boundaries 1 and 3 lie between words, 2 is inside 周末
        self.assertIsNone(boundary_prior(words, 5))  # word timings that do not add up are not trusted


def heard(text: str, exp):
    return assess.heard_syllables(text, exp)


class JudgeTests(unittest.TestCase):
    def judge(self, expected: str, said: str, faint=frozenset()):
        exp = syllables(expected)
        return assess.judge(exp, heard(said, exp), {}, set(faint))

    def statuses(self, expected: str, said: str, faint=frozenset()):
        syls, extra = self.judge(expected, said, faint)
        return [s["status"] for s in syls], extra

    def test_exact(self):
        self.assertEqual(self.statuses("我要买书。", "我要买书"), (["ok"] * 4, 0))

    def test_traditional_script_is_fine(self):
        self.assertEqual(self.statuses("我要买书。", "我要買書")[0], ["ok"] * 4)

    def test_tone_swap_heard(self):
        self.assertEqual(self.statuses("我要买书。", "我要卖书")[0], ["ok", "ok", "tone", "ok"])

    def test_wrong_word(self):
        self.assertEqual(self.statuses("我要买书。", "我要看书")[0], ["ok", "ok", "sound", "ok"])

    def test_missing_syllable(self):
        statuses, extra = self.statuses("我要买书。", "我买书")
        self.assertEqual(statuses.count("missing"), 1)
        self.assertEqual(extra, 0)

    def test_extra_syllable(self):
        statuses, extra = self.statuses("我买书。", "我要买书")
        self.assertEqual(statuses, ["ok"] * 3)
        self.assertEqual(extra, 1)

    def test_nothing_heard(self):
        self.assertEqual(self.statuses("我要买书。", "")[0], ["missing"] * 4)

    def test_sandhi_either_way_is_accepted(self):
        self.assertEqual(self.statuses("你好。", "你好")[0], ["ok", "ok"])
        self.assertEqual(self.statuses("你好。", "尼好")[0], ["ok", "ok"])  # ní hǎo

    def test_erhua_character_in_transcript_is_ignored(self):
        self.assertEqual(self.statuses("一会儿。", "一会儿")[0], ["ok", "ok"])

    def test_faint_syllable_is_missing_even_if_recognised(self):
        self.assertEqual(self.statuses("我要买书。", "我要买书", faint={3})[0], ["ok", "ok", "ok", "missing"])

    def test_faint_does_not_override_a_substitution(self):
        self.assertEqual(self.statuses("我要买书。", "我要看书", faint={2})[0], ["ok", "ok", "sound", "ok"])

    def test_notes_are_written_in_vietnamese(self):
        syls, _ = self.judge("我要买书。", "我要卖书")
        note = syls[2]["note"]
        self.assertIn("thanh 4", note)
        self.assertIn("mǎi", note)


if __name__ == "__main__":
    unittest.main()
