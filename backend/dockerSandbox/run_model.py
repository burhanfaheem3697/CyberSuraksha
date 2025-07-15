import onnxruntime as ort
import numpy as np
import json

INPUT_FILE = "input.json"
MODEL_FILE = "model.onnx"
OUTPUT_FILE = "output.json"

try:
    # Load input
    with open(INPUT_FILE, "r") as f:
        input_json = json.load(f)

    # Load model
    session = ort.InferenceSession(MODEL_FILE)

    # Prepare all input tensors dynamically
    feeds = {}
    for input_def in session.get_inputs():
        name = input_def.name
        if name not in input_json:
            raise ValueError(f"Missing input key: '{name}'")
        arr = np.array(input_json[name], dtype=np.float32)
        feeds[name] = arr

    # Run model
    outputs = session.run(None, feeds)

    # Return first output (for now)
    result = { "output": outputs[0].tolist() }
    with open(OUTPUT_FILE, "w") as f:
        json.dump(result, f)

except Exception as e:
    with open(OUTPUT_FILE, "w") as f:
        json.dump({ "error": str(e) }, f)
