const Imap = require('node-imap');


async function imapFetch(cfg, snapshot, callback) {
  try {
    let { tls } = cfg;
    if (typeof tls === 'string') {
      tls = (tls.trim().toLowerCase() === 'true');
    }
    let { port } = cfg;
    if (typeof port === 'string') {
      port = parseInt(port, 10);
    }

    const config = {
      user: cfg.user,
      password: cfg.password,
      host: cfg.host,
      port,
      tls,
    };

    if (cfg.devMode) console.log('Config:', config);

    const imap = new Imap(config);

    let last = { date: '', sequenceNumber: 1 };
    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err) => { // , box
        if (err) throw err;

        const fetcher = imap.seq.fetch(`${snapshot}:*`, {
          bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
          struct: true,
        });

        fetcher.on('message', (message, sequenceNumber) => {
          console.log('Message #%d', sequenceNumber);

          message.on('body', (stream) => { // , info
            let buffer = '';
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
            stream.once('end', () => {
              const headerData = Imap.parseHeader(buffer);
              const parts = headerData.from[0].trim().match(/^([^<]{0,})<([^>]+)/iu);
              headerData.name = parts[1].trim();
              headerData.email = parts[2].trim();
              headerData.recordUid = sequenceNumber;
              if (cfg.devMode) console.log(headerData);
              callback(headerData);

              if (last.sequenceNumber < sequenceNumber) {
                last = {
                  date: headerData.date,
                  sequenceNumber,
                };
              }
            });
          });

          message.once('end', () => {
            console.log(`Email ${last.sequenceNumber} finished`);
          });
        });

        fetcher.once('error', (er) => {
          console.log(`IMAP fetch error: ${er}`);
        });

        fetcher.once('end', () => {
          console.log('Fetching emails done');
          imap.end();
          callback(true, last);
        });
      });
    });

    imap.once('error', (err) => {
      console.log(err);
    });

    imap.once('end', () => {
      console.log('Connection ended');
    });

    imap.connect();
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  imapFetch,
};
