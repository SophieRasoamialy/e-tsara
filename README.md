# E-Tsara - Student Sheet Auto-Correction Platform

## 📝 Project Description

E-Tsara is an innovative web application enabling automatic self-correction of student sheets. It provides a modern technological solution to simplify and accelerate the academic evaluation process.

## 🚀 Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js 
- **Additional Services**: 
  - Flask (complementary service)
  - MongoDB (database)
- **Deployment**: Kubernetes, Docker, AWS EKS
- **CI/CD**: GitHub Actions

## 🛠 Technical Architecture

The application is built with a microservices architecture comprising:
- A React frontend
- A Node.js backend
- A Flask service for specific processing
- A MongoDB database
- Kubernetes deployment configuration

## 📋 DevOps Prerequisites

Before starting, ensure you have the following tools and access:

- **AWS CLI** installed and configured on your machine
- **kubectl** installed to interact with your Kubernetes cluster
- **eksctl** installed to facilitate EKS cluster management
- **Docker** and **Docker Compose**
- An AWS account with necessary permissions:
  - IAM role creation
  - EKS cluster management
  - CloudWatch usage
- Access to a Kubernetes cluster (EKS or other) for testing

### AWS Configuration

1. Install AWS CLI:
```bash
pip install awscli
aws configure
```

2. Configure your AWS credentials with required rights

3. Install eksctl:
```bash
# For macOS
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl

# For Linux 
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

## 🔧 Kubernetes Deployment

### Deployment File Structure

- `mongo-deployment.yaml`: MongoDB database deployment
- `backend-deployment.yaml`: Node.js backend deployment
- `frontend-deployment.yaml`: React frontend deployment
- `flask-deployment.yaml`: Flask service deployment
- `*-service.yaml`: Kubernetes service configurations

### Deployment Commands

```bash
# Connect to EKS cluster
aws eks update-kubeconfig --name projet-master-eks --region us-east-1

# Create namespace
kubectl create namespace autograder

# Apply deployments
kubectl apply -f mongo-deployment.yaml -n autograder
kubectl apply -f backend-deployment.yaml -n autograder
kubectl apply -f frontend-deployment.yaml -n autograder
```

## 🚀 GitHub Actions CI/CD Pipeline

The CI/CD pipeline is configured to:
- Conditionally build Docker images
- Tag and push images to Docker Hub
- Update Kubernetes cluster
- Manage service-based deployments

### Triggers
- Triggered on pushes to the `main` branch
- Conditional build and deployment based on code modifications

### Main Steps
- Code checkout
- Docker image building
- Docker Hub authentication
- AWS configuration 
- Kubeconfig update
- Kubernetes deployment
- Deployment updates

## 🔐 Required Secrets

Configure the following GitHub secrets:
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

## 💻 Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/SophieRasoamialy/e-tsara.git
cd e-tsara
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env`
- Fill in the necessary configurations

4. Start the application
```bash
docker-compose up
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors

- Sophie Rasoamialy 
