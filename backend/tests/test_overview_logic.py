"""Spaced-repetition schedule and streak counting (pure functions of app.overview)."""

import unittest
from datetime import date, timedelta

from app.overview import review_schedule, streak

D = date(2026, 11, 1)


def days(*offsets: int) -> list[date]:
    return [D + timedelta(days=o) for o in offsets]


class ReviewTests(unittest.TestCase):
    def test_first_review_due_next_day(self):
        s = review_schedule(D, days(0), D + timedelta(days=1))
        self.assertEqual([x["status"] for x in s], ["due"])
        self.assertEqual(s[0]["due"], "2026-11-02")

    def test_not_due_yet(self):
        s = review_schedule(D, days(0), D)
        self.assertEqual(s[0]["status"], "upcoming")

    def test_steps_follow_1_3_7_14_30(self):
        s = review_schedule(D, days(0, 1, 3, 7, 14, 30), D + timedelta(days=40))
        self.assertEqual([x["status"] for x in s], ["done"] * 5)
        self.assertEqual([x["due"] for x in s], [(D + timedelta(days=o)).isoformat() for o in (1, 3, 7, 14, 30)])

    def test_late_review_counts_once(self):
        # one study session on day 5 covers step 1 (due day 1) but not step 2 (due day 3) as well
        s = review_schedule(D, days(0, 5), D + timedelta(days=6))
        self.assertEqual([x["status"] for x in s], ["done", "due"])

    def test_activity_before_due_does_not_count(self):
        s = review_schedule(D, days(0, 2), D + timedelta(days=4))
        self.assertEqual([x["status"] for x in s], ["done", "due"])  # day 2 covers step 1 only


class StreakTests(unittest.TestCase):
    def test_counts_today(self):
        self.assertEqual(streak(set(days(3, 4, 5)), D + timedelta(days=5)), 3)

    def test_not_yet_today_keeps_yesterday_streak(self):
        self.assertEqual(streak(set(days(3, 4)), D + timedelta(days=5)), 2)

    def test_gap_breaks(self):
        self.assertEqual(streak(set(days(1, 3)), D + timedelta(days=5)), 0)


if __name__ == "__main__":
    unittest.main()
