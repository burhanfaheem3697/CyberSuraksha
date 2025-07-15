# Base image with Python 3.10
FROM python:3.10-slim

# Set a non-root user for safer execution
RUN useradd -ms /bin/bash sandbox
USER sandbox

# Set working directory
WORKDIR /app

# Install ONNX Runtime
RUN pip install onnxruntime

# Copy the inference script into container
COPY run_model.py .

# Default command to run when container starts
CMD ["python", "run_model.py"]
