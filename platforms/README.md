# Platforms

Each challenge is stored under its source platform, in a per-language folder:
`platforms/{platform}/{ext}/{problem-id}-{kebab-case-title}/`
(see [../docs/challenge-format.md](../docs/challenge-format.md)).

| Platform | Folder | Strengths | Ideal for | Site |
| --- | --- | --- | --- | --- |
| LeetCode | `leetcode` | Huge problem set, company-tagged questions, contests | General interview and algorithm practice | https://leetcode.com |
| HackerRank | `hackerrank` | Large problem library, interview simulations, used by many companies for screening | Preparing for real technical interviews | https://www.hackerrank.com |
| Codewars | `codewars` | Gamified "kata" across levels, supports 55+ languages | Fun, progressive daily practice | https://www.codewars.com |
| AlgoCademy | `algocademy` | Guided step-by-step tutorials with an AI tutor | Learning the logic, not just solving problems | https://algocademy.com |
| CodeSignal | `codesignal` | Standardized assessments, widely used for company tests | Structured technical evaluations | https://codesignal.com |
| TopCoder | `topcoder` | Competitions and advanced problems | Competitive programming and high-level challenges | https://www.topcoder.com |
| Exercism | `exercism` | Free, with feedback from mentors | Improving via real code review | https://exercism.org |
| Pramp | `pramp` | 1-to-1 mock interviews | Simulating real interviews | https://www.pramp.com |
| Interview Cake | `interview-cake` | Detailed, didactic explanations | Understanding concepts deeply | https://www.interviewcake.com |
| Codility | `codility` | Tests used by companies | Practicing on real company-style challenges | https://www.codility.com |
| StrataScratch | `stratascratch` | Data-science focus (SQL, Python on real datasets) | Data scientists and analysts | https://www.stratascratch.com |
| CodeChef | `codechef` | Regular contests and an active community | Training with contests | https://www.codechef.com |
| Project Euler | `project-euler` | Complex math and algorithmic problems | Math applied to programming | https://projecteuler.net |

To add a new platform, create `platforms/{new-platform}/` (kebab-case) and add a row here.
Some entries (e.g. Pramp, Interview Cake, AlgoCademy) are interview/learning oriented
rather than challenge repositories; use them for didactic write-ups when relevant.
