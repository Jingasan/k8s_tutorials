import amqp from "amqplib";
import { setTimeout } from "timers/promises";

// キュー名
const queueName = "queue";

// メッセージ受信
const main = async () => {
  const url = String(process.env.AMQP_URL);
  // RabbitMQとのTCP接続確立
  let connection: amqp.Connection;
  try {
    connection = await amqp.connect(url);
  } catch (err) {
    console.error("[ERROR] Couldn't connect RabbitMQ.", err);
    return;
  }
  // TCP接続上に論理チャネルを作成
  let channel: amqp.ConfirmChannel;
  try {
    channel = await connection.createConfirmChannel();
  } catch (err) {
    console.error("[ERROR] Couldn't create channel.", err);
    return;
  }
  // キューの作成
  await channel.assertQueue(queueName, {
    durable: true, // 再起動時にキューを残さない
  });
  // メッセージの受信
  console.log(
    `[INFO] Waiting for message in ${queueName}. To exit press CTRL+C`
  );
  await channel.consume(queueName, async (msg) => {
    if (msg) {
      console.log("[INFO] Receive message: " + msg.content.toString());
      // メッセージの受信に成功した為、ACK応答を返す -> キューのメッセージが削除される
      channel.ack(msg);
      // 論理チャネルの切断
      await channel.close();
      // RabbitMQとのTCP接続切断
      await connection.close();
      // sleep [ms]
      await setTimeout(60000);
    } else {
      console.error("[ERROR] Receive null message");
    }
  });
};

main();
