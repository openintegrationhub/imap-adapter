# IMAP-Adapter

This connector accesses a standard IMAP account and fetches the message headers.

## Authorization
Each request to the connected imap account requires an authorization. To do so, pass your imap settings through the config.

The following is an example for the minimal config for the IMAP-Adapter step in the flow:

`{
  user: 'mail@examplemail.com',
  password: 'abcde',
  host: 'imap.examplemail.com',
  port: 993,
  tls: true
}`


## Actions and triggers
The **adapter** supports the following **actions** and **triggers**:

#### Triggers:
  - Get mail header - polling (```getMailHeaderPolling.js```)

  All triggers are of type '*polling'* which means that the **trigger** will be scheduled to execute periodically. It will fetch only these emails from the connected imap account that have been received since the previous execution. Then it will emit one message per object that is added since the last polling interval. For this case at the very beginning we just create an empty `snapshot` object. Later on we attach ``lastUpdated`` to it. At the end the entire object should be emitted as the message body.

  If the flag sendDuplicates is not present in the config fields then the connector will only send entries with uniq email addresses in each fetch.

#### Actions:
  - This connector does not have any actions


## License

Apache-2.0 © [Wice GmbH](https://wice.de/)
