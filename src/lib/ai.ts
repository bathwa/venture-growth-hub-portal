// TensorFlow.js AI integration utility
// Loads models, runs inference, and integrates with DRBE for post-processing

import * as tf from '@tensorflow/tfjs';

// Example: Load a model from public/models or IndexedDB for offline use
export async function loadModel(modelPath: string) {
  // tf.loadLayersModel supports both URL and IndexedDB
  return await tf.loadLayersModel(modelPath);
}

// Run inference on a loaded model
export async function runModel(model: tf.LayersModel, input: tf.Tensor | number[] | number[][]) {
  const tensor = Array.isArray(input) ? tf.tensor(input) : input;
  const output = model.predict(tensor) as tf.Tensor;
  return output.dataSync();
}

// Example: Risk scoring wrapper
export async function getRiskScore(input: number[]) {
  // Use a sample model (must be placed in public/models/risk_model/model.json)
  const model = await loadModel('/models/risk_model/model.json');
  const output = await runModel(model, [input]);
  return output[0];
} 