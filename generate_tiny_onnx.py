import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import onnx

# Prepare dummy dataset (income + credit_score)
X = np.array([
    [45000, 720],
    [25000, 600],
    [80000, 820],
    [30000, 580],
    [60000, 750]
], dtype=np.float32)

y = np.array([1, 0, 1, 0, 1])  # Approved: 1 or 0

# Train model
model = make_pipeline(StandardScaler(), LogisticRegression())
model.fit(X, y)

# Convert to ONNX
initial_type = [('input', FloatTensorType([1, 2]))]  # 2 features per row
onnx_model = convert_sklearn(model, initial_types=initial_type)

# Save
onnx.save_model(onnx_model, "multi_input_model.onnx")
print("✅ ONNX model saved as multi_input_model.onnx")
