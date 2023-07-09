import * as k8s from "@kubernetes/client-node";

// 起動中の全Pod名の表示
const listAllName = async () => {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  const res = await k8sApi.listNamespacedPod("default");
  for (const pod of res.body.items) {
    console.log(pod.metadata?.name);
  }
};

const main = async () => {
  await listAllName();
};
main();
