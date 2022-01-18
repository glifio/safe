# Glif Safe

<!-- Glif art/branding -->

The Glif Safe is a Filecoin multisig built with Next.js that allows you to:

- **view** available and vesting balances
- **withdraw** available balances from a multisig to another Filecoin address
- **change owners** of a multisig wallet
- **remove a PL signer** of a multisig wallet

### Install

```bash
npm install
npm run dev
```

### Versioning

Glif follows semantic versioning.

Version **x.y.z**:

- When releasing **critical bug fixes** we make a **patch release** by changing the **z** number (e.g. 1.3.2 to 1.3.3).
- When releasing **new features** or **non-critical fixes**, we make a **minor release** by changing the **y** number (e.g. 1.3.3 to 1.4.0).
- When releasing **breaking changes**, we make a **major release** by changing the **x** number (e.g. 1.4.0 to 2.0.0).

### Filecoin modules

A number of modules have been broken out into packages in this [modules repo](https://github.com/glifio/modules).

- [Filecoin wallet provider](https://github.com/glifio/modules/tree/primary/packages/filecoin-wallet-provider)
- [Filecoin jsonrpc client](https://github.com/glifio/modules/tree/primary/packages/filecoin-rpc-client)
- [Filecoin number type](https://github.com/glifio/modules/tree/primary/packages/filecoin-number)
- [Filecoin message type](https://github.com/glifio/modules/tree/primary/packages/filecoin-message)
- [Filecoin address type](https://github.com/glifio/modules/tree/primary/packages/filecoin-address)
- [Filecoin message confirmer](https://github.com/glifio/modules/tree/primary/packages/filecoin-message-confirmer)
- [Filecoin react-components](https://github.com/glifio/modules/tree/primary/packages/react-components)

#### Filecoin module package local development

In order to develop packages locally and see the changes live in this local wallet repository, the [npm link](https://docs.npmjs.com/cli/v7/commands/npm-link) tool can be used to symlink to the packages in your local modules repo.

Package linking is a two-step process.

First, from your local package folder, run:

```
npm link
```

Next, from this main wallet repository, run:

```
npm link @glif/<package-name>
```

for example, use `npm link @glif/react-components` to symlink the `react-components` package to your local version. See the npm link docs for details.
