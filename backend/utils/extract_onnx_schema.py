# extract_onnx_schema.py

import onnx
import json
import sys

def extract_input_schema(onnx_path):
    model = onnx.load(onnx_path)
    inputs = model.graph.input

    result = {}
    for i in inputs:
        name = i.name
        shape = [
            d.dim_value if d.HasField("dim_value") else -1
            for d in i.type.tensor_type.shape.dim
        ]
        result[name] = shape
    return result

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 extract_onnx_schema.py <model.onnx>")
        sys.exit(1)

    model_path = sys.argv[1]
    schema = extract_input_schema(model_path)
    print(json.dumps(schema))
