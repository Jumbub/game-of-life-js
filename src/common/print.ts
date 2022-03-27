export const print = (text: string) => {
  const result = document.createElement('div');
  result.style.position = 'fixed';
  result.style.top = '50%';
  result.style.left = '50%';
  result.style.transform = 'translate(-50%, -50%)';
  result.style.padding = '10px';
  result.style.backgroundColor = 'black';
  result.style.border = '2px solid red';
  result.style.color = 'white';
  result.innerHTML = text.replace(/\n/g, '<br/>');
  document.body.append(result);
};
