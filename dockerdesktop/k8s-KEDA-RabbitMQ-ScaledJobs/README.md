# RabbitMQ consumer and sender

A simple docker container that will receive messages from a RabbitMQ queue and scale via KEDA. The receiver will receive a single message at a time (per instance), and sleep for 1 second to simulate performing work. When adding a massive amount of queue messages, KEDA will drive the container to scale out according to the event source (RabbitMQ).

## Pre-requisites

- Kubernetes cluster
- Helm v3

## Setup

This setup will go through creating a RabbitMQ queue on the cluster and deploying this consumer with the `ScaledObject` to scale via KEDA. If you already have RabbitMQ you can use your existing queues.

First you should clone this project.

### Creating a KEDA

#### Install KEDA via Helm

Install [KEDA 2.0 installed](https://keda.sh/docs/deploy/) on the cluster.

```cli
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
helm install keda kedacore/keda --namespace keda --create-namespace --version 2.11.1
```

### Creating a RabbitMQ queue

#### Install RabbitMQ via Helm

Since the Helm stable repositoty was migrated to the [Bitnami Repository](https://github.com/helm/charts/tree/master/stable/rabbitmq), add the Bitnami repo and use it during the installation:

```cli
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install rabbitmq --set auth.username=user --set auth.password=PASSWORD bitnami/rabbitmq --wait --version 12.0.4
```

**Notes:**

- If running this demo on a computer with a ARM Processor, refer to the earlier note
- If using KinD refer to the earlier note
- For RabbitMQ Helm Chart version 6.x.x or earlier, refer to the earlier note

#### Wait for RabbitMQ to Deploy

⚠️ Be sure to wait until the deployment has completed before continuing. ⚠️

```cli
kubectl get po

NAME         READY   STATUS    RESTARTS   AGE
rabbitmq-0   1/1     Running   0          3m3s
```

### Build docker image

```cli
docker-compose build
```

### Deploying a RabbitMQ consumer

#### Deploy a consumer

```cli
kubectl apply -f receiver-job.yml
```

#### Validate the consumer has deployed

```cli
kubectl get deploy
```

You should see `rabbitmq-consumer` deployment with 0 pods as there currently aren't any queue messages and for that reason it is scaled to zero.

```cli
NAME                DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
rabbitmq-consumer   0         0         0            0           3s
```

[This consumer](https://github.com/kedacore/sample-go-rabbitmq/blob/master/cmd/receive/receive.go) is set to consume one message per instance, sleep for 1 second, and then acknowledge completion of the message. This is used to simulate work. The [`ScaledObject` included in the above deployment](receiver-job.yml) is set to scale to a minimum of 0 replicas on no events, and up to a maximum of 30 replicas on heavy events (optimizing for a queue length of 5 message per replica). After 30 seconds of no events the replicas will be scaled down (cooldown period). These settings can be changed on the `ScaledObject` as needed.

### Publishing messages to the queue

#### Deploy the publisher job

The following job will publish 300 messages to the "hello" queue the deployment is listening to. As the queue builds up, KEDA will help the horizontal pod autoscaler add more and more pods until the queue is drained after about 2 minutes and up to 30 concurrent pods. You can modify the exact number of published messages in the `sender-job.yml` file.

```cli
kubectl apply -f sender-job.yml
```

#### Validate the deployment scales

```cli
kubectl get deploy -w
```

You can watch the pods spin up and start to process queue messages. As the message length continues to increase, more pods will be pro-actively added.

You can see the number of messages vs the target per pod as well:

```cli
kubectl get hpa
```

After the queue is empty and the specified cooldown period (a property of the `ScaledObject`, default of 300 seconds) the last replica will scale back down to zero.

## Cleanup resources

```cli
kubectl delete -f receiver-job.yml
kubectl delete -f sender-job.yml
helm delete rabbitmq
```
