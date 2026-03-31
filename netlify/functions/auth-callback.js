const https = require('https');

function exchangeCodeForToken(code, clientId, clientSecret) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    });

    const options = {
      hostname: 'github.com',
      port: 443,
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'netlify-cms-auth',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response from GitHub'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

exports.handler = async (event) => {
  const { code } = event.queryStringParameters || {};
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

  if (!code) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: '<p>Missing authorization code.</p>',
    };
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: '<p>Server configuration error: Missing environment variables.</p>',
    };
  }

  let tokenData;
  try {
    tokenData = await exchangeCodeForToken(code, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<p>Token exchange failed: ${err.message}</p>`,
    };
  }

  if (tokenData.error || !tokenData.access_token) {
    const msg = tokenData.error_description || tokenData.error || 'Unknown error';
    const html = `<!DOCTYPE html><html><body><script>
      window.opener && window.opener.postMessage(
        'authorization:github:error:' + JSON.stringify({message: ${JSON.stringify(msg)}}),
        '*'
      );
      setTimeout(function(){ window.close(); }, 1000);
    </script><p>Authentication error: ${msg}</p></body></html>`;
    return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html };
  }

  const token = tokenData.access_token;
  const html = `<!DOCTYPE html><html><body><script>
    (function() {
      var provider = 'github';
      var token = ${JSON.stringify(token)};
      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:' + provider + ':success:' + JSON.stringify({token: token, provider: provider}),
          e.origin
        );
        window.close();
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:' + provider, '*');
    })();
  </script><p>Authenticating, please wait...</p></body></html>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: html,
  };
};
