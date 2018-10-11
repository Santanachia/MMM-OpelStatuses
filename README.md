# MagicMirrorModule-OpelStatuses

[MagicMirror Project on Github](https://github.com/MichMich/MagicMirror)

## Usage 

To use this module, go to the *modules* subfolder of your mirror and clone this repository.
Go into `MMM-OpelStatuses` folder
Run `npm install`

### Configuration

To run the module, you need to add the following data to your config.js file.

```
{
  module: 'MMM-OpelStatuses',
  position: 'top_center', // you may choose any location
  config: {
    JOBID: '0012vhnn',
    //VIN: 'W0VBF8EH9J8024861'
  }
}
```
### JOBID
You can get if from Opel dealer who seller you a car.
```
  JOBID: '0012vhnn'
```

### VIN
```
  VIN: 'W0VBF8EH9J8024861'
```

You may want to set the following options in the config section as well:

| Option |  Description | 
|---|---|
| `JOBID` | The ID of your order.<br><br>This (or VIN) is **REQUIRED**. | 
| `VIN` | The of your car.<br><br>This (or JOBID) is **REQUIRED**. | 

### Known Issues
