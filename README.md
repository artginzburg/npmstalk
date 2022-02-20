# Usage

## As a terminal utility

```ps1
npx @artginzburg/npmstalk username
```

Output example:
`{ total: 1247, packages: { somename: 515, anotherpackage: 732 } }`

## As a package

`npm i @artginzburg/npmstalk`

```js
import getMaintainerDownloads from '@artginzburg/npmstalk`

async function doSomething() {
  // some code
  const usernameDownloads = await getMaintainerDownloads('username')

  console.log(`Hey, username has ${usernameDownloads.total} downloads already!`)
  // ...
}
// ...
doSomething() // Hey, username has 615 downloads already!
```

# Prerequisites

- Node.JS
