export const toBinaryString = e =>
  new Promise((resolve, reject) => {
    let file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = event => {
        resolve(event.target.result);
    }

    reader.onerror = () => reject(reader.error);

    reader.readAsBinaryString(file);
  });
