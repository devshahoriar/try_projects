import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { existsSync } from 'fs';

// Function to find the correct proto file path
function getProtoPath(): string {
  const developmentPath = join(process.cwd(), 'src', 'proto', 'chatbot.proto');
  const productionPath = join(process.cwd(), 'dist', 'proto', 'chatbot.proto');
  
  // Check if we're in development mode (src folder exists)
  if (existsSync(developmentPath)) {
    return developmentPath;
  }
  
  // Check if we're in production mode (dist folder exists)
  if (existsSync(productionPath)) {
    return productionPath;
  }
  
  // Fallback to development path
  return developmentPath;
}

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'chatbot',
    protoPath: getProtoPath(),
    url: process.env.CHATBOT_GRPC_URL || 'localhost:50051',
    loader: {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    },
  },
};
