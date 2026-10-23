# C55 · Offline Testing and Evals

Executes an authored provider-port replay and host scorer. It does not benchmark model quality, latency, or permissions. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Provider-behind-a-port testing
- Fixture outcomes are host-contract evidence
- Truncation must remain incomplete

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3055`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3055
```

## How the app was build

### 1. Preserve fixture provenance

An authored event sequence cannot be relabelled as a live observation. The early rejection protects the meaning of every later assertion.

Source: [src/lesson.ts](src/lesson.ts#L13)

```typescript
if (text(input, "fixtureLabel") !== "authored")
  return report(
    "rejected",
    "An authored fixture cannot be relabelled as a live observation",
    {},
    ["Preserve evidence provenance"],
  );
```

### 2. Score lifecycle evidence without claiming model quality

end_turn permits completion, requires_action pauses an otherwise unfinished sequence, and truncation remains incomplete. The result records message/terminal assertions while modelQuality stays not measured; this reducer scores a supplied fixture sequence.

Source: [src/lesson.ts](src/lesson.ts#L14) · selected statements

```typescript
const sequence = list(input, "sequence").map(String),
  completed = sequence.includes("end_turn"),
  paused = sequence.includes("requires_action") && !completed;

return report(
  completed ? "passed" : paused ? "paused" : "incomplete",
  "Scored only the fixture-specific host contract",
  {
    completed,
    source: "authored fixture",
    assertions: {
      sawMessage: sequence.includes("message"),
      sawTerminal: completed,
    },
    modelQuality: "not measured",
  },
  [
    "Use one fixture adapter per run",
    "Execute the shared consumer",
    "Require terminal lifecycle evidence",
    "Keep the score bound to its evidence source",
  ],
);
```

### Check your understanding

Run **A completed authored host run** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "sequence": [
      "running",
      "message",
      "end_turn"
    ],
    "fixtureLabel": "authored"
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "completed": true
  }
}
```

Then try **A truncated authored host run**. Its expected outcome is `incomplete`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
