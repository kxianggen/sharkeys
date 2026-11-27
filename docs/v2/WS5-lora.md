# WS5 — LoRA fine-tuning experiment (side track)

## Paste this to start (Claude Code for the data and scoring scripts; Google Colab for training; branch `v2-ws5-lora`)

> You're working on Sharkeys v2, workstream WS5. Read `docs/v2/00-plan.md` and `docs/v2/WS5-lora.md`. Start in plan mode and wait for my approval. The WS0 TEST set must never appear in the training data; prove it with an overlap check. Write the Colab notebook with plain-English comments on every cell. When you finish, fill in "Report back", then walk me through the Learn card in plain words.

## Why

In the FYP Q&A you were asked whether you fine-tuned the model. The goal here is to understand when fine-tuning is worth it, and to answer with a measured result. It won't be shipped to production.

## The question

Can a small open model, fine-tuned with LoRA, do Sharkeys' intent extraction (turning a message into the structured requirements JSON) as well as gpt-4.1-mini? And at what speed and cost?

**Four contenders:**
1. The keyword baseline (already exists)
2. gpt-4.1-mini with the current prompt
3. A small Qwen model with no fine-tuning (prompt only)
4. The same Qwen model plus a LoRA adapter

**Metrics, all on the frozen WS0 TEST set:**
- valid-JSON rate
- field accuracy (per field and overall)
- latency
- cost per 1,000 requests (API price vs. GPU time)
- training time

## Subtasks

1. **Training data (distillation).**
   - Generate 600–1,000 new messages from the persona pack, using a different random seed and new phrasings.
   - Check none overlap with TEST, for both exact and near-duplicate matches.
   - A bigger "teacher" model (gpt-4.1) labels them in the exact JSON schema, and zod validates the labels.
   - Jayson spot-checks 40, and bad ones are dropped.
2. **Split:** 90% for training, 10% for validation.
3. **Colab notebook with Unsloth.**
   - Load a small Qwen model. Start at about 2B, and try 4B if there's time.
   - Add a LoRA adapter and train for 1–3 epochs on the free T4 GPU.
   - Save only the adapter, to Google Drive.
   - Claude writes the notebook; Jayson runs it.
4. **Evaluate all four contenders** with the same scorer (reuse the WS0 scorer; export TEST into the notebook).
5. **Results.** A table plus one paragraph that makes a decision: "Would I ship this? Why or why not?" Cover cost, accuracy, hosting and maintenance.
6. **Stretch:** run the adapter locally with Ollama and plug it into Sharkeys behind a feature flag, for a demo.

## Watch-outs

- **Leakage is the biggest risk.** If TEST examples are in the training data, the results mean nothing.
- **Free Colab sessions disconnect,** so save checkpoints to Drive.
- **Use the same chat template at inference as in training.** Unsloth's docs list a mismatch as the most common reason a model performs worse after export.
- **Tiny models often break JSON,** so measure the valid-JSON rate separately.
- **Don't over-train.** Watch the validation loss: if it starts rising, stop.

## Needs approval

Any paid GPU (for example Colab Pro); the teacher labelling. Labelling 600–1,000 messages with gpt-4.1 will probably need an OpenAI top-up, so estimate the cost and ask first. A cheaper fallback is to label with gpt-4.1-mini and spot-check more.

## Learn card

**Flow:** personas → new messages → big model labels them → check for overlap with TEST → train a LoRA adapter on Colab → score all four contenders on TEST → decide.

- **Prompting vs. RAG vs. fine-tuning:** prompting changes the instructions; RAG changes what the model can look up; fine-tuning changes the model itself.
- **LoRA:** instead of changing all of a model's billions of numbers, you train a small add-on (a few million numbers) that sits beside the model. It's cheap, the file is small, and you can swap it in and out.
- **Distillation:** a big model teaches a small one by labelling examples for it.
- **Overfitting:** the model memorises its training examples and fails on new ones. Validation loss is how you catch it.
- **When fine-tuning is worth it:** one narrow task, high volume, where cost or speed matters and better prompting can't fix the output format.

**Interview questions to practise:**
- "Did you fine-tune?" Answer with: "Yes, as an experiment: [numbers]. I decided X because Y."
- "What's LoRA, in one sentence?"
- "How did you avoid cheating?"

## Report back (session fills this in)

- The four-contender results table
- Dataset size, and the overlap check result
- Training time and settings
- The decision paragraph
- Open questions for HQ
