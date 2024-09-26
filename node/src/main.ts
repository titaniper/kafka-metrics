import express from 'express';
import { Kafka } from "kafkajs";
import { Registry, collectDefaultMetrics } from "prom-client";
import { monitorKafkaJSProducer, monitorKafkaJSConsumer, monitorKafkaJSAdmin } from "@christiangalsterer/kafkajs-prometheus-exporter";

const app = express();
const port = 8080;

(async () => {
    const clientId = 'myClientId'
    const kafka = new Kafka({
        clientId: clientId,
        brokers: ['localhost:9092'],
    })
  
    const producer = kafka.producer()
    const consumer = kafka.consumer({ groupId: 'myGroupId' })
  
    // set up the prometheus client
    const register = new Registry();
    collectDefaultMetrics({ register })
  
    // @ts-ignore monitor KafkaJS producer 
    monitorKafkaJSProducer(producer, register, { defaultLabels: {client_id: clientId} })
    
    // @ts-ignore monitor KafkaJS consumer
    monitorKafkaJSConsumer(consumer, register, { defaultLabels: {client_id: clientId} })
    
  // connect to Kafka *after* calling monitorKafkaJSProducer() / monitorKafkaJSConsumer / monitorKafkaJSAdmin
  await producer.connect()
  await consumer.connect()

  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log(`Received message: ${message.value}`)
    },
  });

   // Expose metrics on /metrics endpoint
   app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

    // Start server
    app.listen(port, () => {
        console.log(`Metrics server listening at http://localhost:${port}/metrics`);
    });
})()