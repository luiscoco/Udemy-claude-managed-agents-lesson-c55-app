import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 55,
  title: "Offline Testing and Evals",
  description: "Testing every host change against a live model is slow, costly, and difficult to reproduce. A provider port lets the same host runner use either a live SDK adapter or an authored fixture adapter.",
  concepts: ["Provider-behind-a-port testing", "Fixture outcomes are host-contract evidence", "Truncation must remain incomplete"],
  scope: "Executes an authored provider-port replay and host scorer. It does not benchmark model quality, latency, or permissions. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "A completed authored host run", "input": {"sequence": ["running", "message", "end_turn"], "fixtureLabel": "authored"}, "expected": "passed", "checks": {"completed": true}}, {"id": "1", "label": "A truncated authored host run", "input": {"sequence": ["running", "message"], "fixtureLabel": "authored"}, "expected": "incomplete", "checks": {"completed": false}}, {"id": "2", "label": "Reject a fixture mislabelled as live", "input": {"sequence": ["end_turn"], "fixtureLabel": "live"}, "expected": "rejected", "checks": {}}],
  async run(input) {

if(text(input,"fixtureLabel")!=="authored")return report("rejected","An authored fixture cannot be relabelled as a live observation",{},["Preserve evidence provenance"]);
const sequence=list(input,"sequence").map(String),completed=sequence.includes("end_turn"),paused=sequence.includes("requires_action")&&!completed;
return report(completed?"passed":paused?"paused":"incomplete","Scored only the fixture-specific host contract",{completed,source:"authored fixture",assertions:{sawMessage:sequence.includes("message"),sawTerminal:completed},modelQuality:"not measured"},["Use one fixture adapter per run","Execute the shared consumer","Require terminal lifecycle evidence","Keep the score bound to its evidence source"]);

  }
};
