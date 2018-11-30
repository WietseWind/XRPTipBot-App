# fix root-sibling package problem
#if [ "$(uname)" == "Darwin" ]; then
#    sed -i _backup -E 's/export default class/export default class Root/' "./node_modules/react-native-root-siblings/index.js"
#elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
#    sed -i 's=\bexport default class\b=export default class Root=' "./node_modules/react-native-root-siblings/index.js"
#fi
