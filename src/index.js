export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/.well-known/webfinger") {
      return new Response("Not Found", { status: 404 });
    }

    const resource = url.searchParams.get("resource");
    if (!resource) {
      return new Response(
        JSON.stringify({ error: "missing_resource" }),
        { status: 400, headers: { "content-type": "application/jrd+json; charset=utf-8" } }
      );
    }

    // Tailscale uses acct:user@domain form
    const m = resource.match(/^acct:([^@]+)@(.+)$/i);
    if (!m) {
      return new Response(
        JSON.stringify({ error: "invalid_resource" }),
        { status: 400, headers: { "content-type": "application/jrd+json; charset=utf-8" } }
      );
    }

    const domain = m[2].toLowerCase();
    if (domain !== "pathflow.net") {
      return new Response("Not Found", { status: 404 });
    }

    const issuer = env.OIDC_ISSUER; // set this in wrangler.toml

    const body = {
      subject: `acct:${m[1]}@pathflow.net`,
      links: [
        {
          rel: "http://openid.net/specs/connect/1.0/issuer",
          href: issuer,
        },
      ],
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        "content-type": "application/jrd+json; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  },
};

