self.onmessage = async (e) => {
  const file = e.data;
  try {
    const ds = new DecompressionStream("gzip");
    const stream = file.stream().pipeThrough(ds);
    const response = new Response(stream);
    const text = await response.text();
    self.postMessage({ type: "SUCCESS", text, fileName: file.name });
  } catch (err) {
    self.postMessage({
      type: "ERROR",
      message: err.message,
      fileName: file.name,
    });
  }
};
