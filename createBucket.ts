import { imageService } from './services/imageService';

const createBucket = async () => {
  try {
    await imageService.initializeBucket();
    console.log('Successfully created or verified the "blog-images" bucket.');
  } catch (error) {
    console.error('Error initializing bucket:', error);
    process.exit(1);
  }
};

createBucket();
