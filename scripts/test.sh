#!/usr/bin/env bash

GREP='*'
BROWSER='Chrome'

while [[ $# > 1 ]]
do
key="$1"

case $key in
    -g|--grep)
    GREP="$2"
    shift
    ;;
    -b|--browsers)
    BROWSER="$2"
    shift
    ;;
    *)
            # unknown option
    ;;
esac
shift
done

mkdir -p dist/js/tests
ENTRIES=`find client/tests -name "test.$GREP.js" | xargs echo`

echo 'Building bundle'
browserify client/tests/index.js $ENTRIES > client/tests/tests.bundle.js

karma start karma.conf.js --browsers $BROWSER
