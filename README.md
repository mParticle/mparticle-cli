<img src="https://static.mparticle.com/sdk/mp_logo_black.svg" width="280"><br>

# mParticle CLI

mParticle Command Line Interface

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mp.svg)](https://npmjs.org/package/mp)

<!-- toc -->
* [mParticle CLI](#mparticle-cli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

## DEMO Usage

- Clone the repo and `cd` into the directory
- `npm install`
- `npm link`

Run `mp`

### Unlink when you're done

Run `npm unlink` in the directory. This will remove the link to `mp`.

Note: Ignore the usage section below. That's for when we get into production)

## Production Usage (NOT SUPPORTED YET)

`npm -g install @mparticle/cli`

<!-- usage -->
```sh-session
$ npm install -g @mparticle/cli
$ mp COMMAND
running command...
$ mp (-v|--version|version)
@mparticle/cli/1.0.1-alpha.1 darwin-x64 node-v10.15.3
$ mp --help [COMMAND]
USAGE
  $ mp COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`mp help [COMMAND]`](#mp-help-command)
* [`mp planning:batches:validate`](#mp-planningbatchesvalidate)
* [`mp planning:data-plan-versions:fetch`](#mp-planningdata-plan-versionsfetch)
* [`mp planning:data-plans:fetch`](#mp-planningdata-plansfetch)
* [`mp planning:events:validate`](#mp-planningeventsvalidate)

## `mp help [COMMAND]`

display help for mp

```
USAGE
  $ mp help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `mp planning:batches:validate`

Validates Event Batches

```
USAGE
  $ mp planning:batches:validate

OPTIONS
  -o, --outFile=outFile                      (optional) Output file for results (defaults to standard output)
  --batch=batch                              Batch as Stringified JSON
  --batchFile=batchFile                      Path to saved JSON file of a Batch
  --dataPlan=dataPlan                        Data Plan as Stringified JSON
  --dataPlanFile=dataPlanFile                Path to saved JSON file of a Data Plan
  --dataPlanVersion=dataPlanVersion          Data Plan Version Document as Stringified JSON
  --dataPlanVersionFile=dataPlanVersionFile  Path to saved JSON file of a Data Plan Version
  --logLevel=error|warn|info|debug|silent    [default: info] Log Level
  --versionNumber=versionNumber              Data Plan Version Number

DESCRIPTION
  Data Plans are comprised of one or more Version Documents and are used to validate a Batch.
  
  A Data Plan Version can be directly referenced by using either the --dataPlanVersion or --dataPlanVersionFile flags
  Otherwise, a --dataPlan or --dataPlanFile must be accompanied by a --versionNumber.

  For more information, visit: https://github.com/mParticle/mparticle-cli

ALIASES
  $ mp plan:b:val

EXAMPLES
  $ mp planning:batches:validate --batch=[BATCH] --dataPlan=[DATA_PLAN] --versionNumber=[VERSION_NUMBER]
  $ mp planning:batches:validate --batch=[BATCH] --dataPlanVersion=[DATA_PLAN_VERSION]
  $ mp planning:batches:validate --batchFile=/path/to/batch --dataPlanFile=/path/to/dataplan 
  --versionNumber=[VERSION_NUMBER]
  $ mp planning:batches:validate --batchFile=/path/to/batch --dataPlanVersion=/path/to/dataplanversion
```

_See code: [src/commands/planning/batches/validate.ts](https://github.com/mParticle/mparticle-cli/blob/v1.0.1-alpha.1/src/commands/planning/batches/validate.ts)_

## `mp planning:data-plan-versions:fetch`

Fetches a Data Plan Version

```
USAGE
  $ mp planning:data-plan-versions:fetch

OPTIONS
  -o, --outFile=outFile                    (optional) Output file for results (defaults to standard output)
  --accountId=accountId                    (required) mParticle Account ID
  --dataPlanId=dataPlanId                  (required) Data Plan ID
  --logLevel=error|warn|info|debug|silent  [default: info] Log Level
  --orgId=orgId                            (required) mParticle Organization ID
  --token=token                            (required) mParticle Token
  --versionNumber=versionNumber            (required) Data Plan Version Number
  --workspaceId=workspaceId                (required) mParticle Workspace ID

DESCRIPTION
  Data Plan Versions are a subset of Data Plans and are used to validate batches.
  
  A Version Document can be fetched by using your account credentials and a --versionNumber and --dataPlanId.

  For more information, visit: https://github.com/mParticle/mparticle-cli

ALIASES
  $ mp plan:dpv:fetch

EXAMPLE
  $ mp planning:data-plan-versions:fetch --dataPlanId=[DATA_PLAN_ID] --versionNumber=[VERSION_NUMBER] --orgId=[ORG_ID] 
  --accountId=[ACCOUNT_ID] --workspaceId=[WORKSPACE_ID]
```

_See code: [src/commands/planning/data-plan-versions/fetch.ts](https://github.com/mParticle/mparticle-cli/blob/v1.0.1-alpha.1/src/commands/planning/data-plan-versions/fetch.ts)_

## `mp planning:data-plans:fetch`

Fetches a Data Plan

```
USAGE
  $ mp planning:data-plans:fetch

OPTIONS
  -o, --outFile=outFile                    (optional) Output file for results (defaults to standard output)
  --accountId=accountId                    (required) mParticle Account ID
  --dataPlanId=dataPlanId                  (required) Data Plan ID
  --logLevel=error|warn|info|debug|silent  [default: info] Log Level
  --orgId=orgId                            (required) mParticle Organization ID
  --token=token                            (required) mParticle Token
  --workspaceId=workspaceId                (required) mParticle Workspace ID

DESCRIPTION
  Data Plans are comprised of one or more Data Plan Versions.
  
  A Data Plan can be fetched using your account credentials and using a valid --dataPlanId

  For more information, visit: https://github.com/mParticle/mparticle-cli

ALIASES
  $ mp plan:dp:fetch

EXAMPLE
  $ mp planning:data-plan:fetch --dataPlanId=[DATA_PLAN_ID] --orgId=[ORG_ID] --accountId=[ACCOUNT_ID] 
  --workspaceId=[WORKSPACE_ID]
```

_See code: [src/commands/planning/data-plans/fetch.ts](https://github.com/mParticle/mparticle-cli/blob/v1.0.1-alpha.1/src/commands/planning/data-plans/fetch.ts)_

## `mp planning:events:validate`

Validates an Event

```
USAGE
  $ mp planning:events:validate

OPTIONS
  -o, --outFile=outFile                      (optional) Output file for results (defaults to standard output)
  --dataPlan=dataPlan                        Data Plan as Stringified JSON
  --dataPlanFile=dataPlanFile                Path to saved JSON file of a Data Plan
  --dataPlanVersion=dataPlanVersion          Data Plan Version Document as Stringified JSON
  --dataPlanVersionFile=dataPlanVersionFile  Path to saved JSON file of a Data Plan Version
  --event=event                              Event as Stringified JSON
  --eventFile=eventFile                      Path to saved JSON file of an Event
  --logLevel=error|warn|info|debug|silent    [default: info] Log Level
  --translateEvents                          Translate minified event into standard event
  --versionNumber=versionNumber              Data Plan Version Number

DESCRIPTION
  Data Plans are comprised of one or more Data Plan Versions and are used to validate an Event.
  
  A Data Plan Version can be directly referenced by using either the --dataPlanVersion or --dataPlanVersionFile flags
  Otherwise, a --dataPlan or --dataPlanFile must be accompanied by a --versionNumber.
  For more information, visit: https://github.com/mParticle/mparticle-cli

ALIASES
  $ mp plan:e:val

EXAMPLES
  $ mp planning:events:validate --event=[EVENT] --dataPlan=[DATA_PLAN] --versionNumber=[VERSION_NUMBER]
  $ mp planning:events:validate --event=[EVENT] --dataPlanVersion=[DATA_PLAN_VERSION]
  $ mp planning:events:validate --event=[EVENT] --dataPlanVersion=[DATA_PLAN_VERSION] --translateEvents
  $ mp planning:events:validate --eventFile=/path/to/event --dataPlanFile=/path/to/dataplan 
  --versionNumber=[VERSION_NUMBER]
  $ mp planning:events:validate --eventFile=/path/to/event --dataPlanVersionFile=/path/to/dataplanversio
  $ mp planning:events:validate --eventFile=/path/to/event --dataPlanVersionFile=/path/to/dataplanversio 
  --translateEvents
```

_See code: [src/commands/planning/events/validate.ts](https://github.com/mParticle/mparticle-cli/blob/v1.0.1-alpha.1/src/commands/planning/events/validate.ts)_
<!-- commandsstop -->
