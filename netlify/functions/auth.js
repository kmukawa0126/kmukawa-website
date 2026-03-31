exports.handler = async (event) => {
  const { GITHUB_CLIENT_ID } = process.env;
  const host = event.headers['x-forwarded-proto'] + '://' + event.headers.host;
  const callbackURL = `${host}/.netlify/functions/auth-callback`;

  if (!GITHUB_CLIENT_ID) {
    return {
      statusCode: 500,
      body: 'GITHUB_CLIENT_ID environment variable not set',
    };
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: callbackURL,
  });

  return {
    statusCode: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Cache-Control': 'no-cache',
    },
    body: '',
  };
};
