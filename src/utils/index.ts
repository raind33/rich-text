const getUrlName = (url:any) => {
  return url && url.split('?')[0].split('/').reverse()[0];
};
export const loadJs = (url:string) => {
  const name = getUrlName(url);
  const id = 'js_' + name;
  return new Promise<void>((resolve, reject) => {
    // if (loaded[id]) {
    //   return resolve();
    // }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    script.id = id;
    script.onload = () => {
      // loaded[id] = true;
      resolve();
    };
    script.onerror = () => {
      // reject();
    };
    document.body.appendChild(script);
  });
};