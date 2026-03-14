import { pipeline } from '@xenova/transformers';

/**
 * Service to run Hugging Face models directly in the browser
 */
const visionModel = {
  classifier: null,

  async init() {
    if (!this.classifier) {
      console.log('Loading plant classification model...');
      this.classifier = await pipeline('image-classification', 'Xenova/resnet-50');
    }
  },

  async classifyPlant(imageSource) {
    await this.init();
    try {
      const output = await this.classifier(imageSource);
      return output;
    } catch (error) {
      console.error('Classification error:', error);
      throw error;
    }
  }
};

export default visionModel;
