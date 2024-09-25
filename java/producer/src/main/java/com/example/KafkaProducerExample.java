package com.example;

import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Properties;
import java.util.concurrent.ExecutionException;

public class KafkaProducerExample {
    public static void main(String[] args) {
        // Kafka Producer 설정
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        // JMX 메트릭 활성화
        props.put(ProducerConfig.METRICS_RECORDING_LEVEL_CONFIG, "INFO");

        // Producer 생성
        try (Producer<String, String> producer = new KafkaProducer<>(props)) {
            // 메시지 전송
            for (int i = 0; i < 1000; i++) {
                String key = "key_" + i;
                String value = "value_" + i;
                ProducerRecord<String, String> record = new ProducerRecord<>("test-topic", key, value);

                try {
                    RecordMetadata metadata = producer.send(record).get();
                    System.out.printf("Sent record(key=%s value=%s) meta(partition=%d, offset=%d)\n",
                            record.key(), record.value(), metadata.partition(), metadata.offset());

                    // 1초 대기
                    Thread.sleep(1000);
                } catch (InterruptedException | ExecutionException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}