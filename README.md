# FusionSuite - Frontend

## Introduction

It's the frontend of FusionSuite.


## Technologies

It use Ionic / Angular, so developped in typescript ;)


## Run in developpment mode

To run / recompile in live on your computer, run the command:

```
./node_modules/.bin/ionic serve
```


## Compilation

### Web version

To compile it, run the command:

```
./node_modules/.bin/ionic build --prod -- --aot=true --buildOptimizer=true --optimization=true --vendor-chunk=true
```

The files are located in the folder `www`, so upload these files / folders in your webserver.

