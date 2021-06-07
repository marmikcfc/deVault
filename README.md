# deVault

To run on emulator
``` npx react-native run-android ```

To sign apk
``` cd mobile/android && ./gradlew assembleRelease```

To create apk
```npx react-native run-android --variant=release```    

To Create SHA1 KEy
``` cd mobile/android && ./gradlew signingReport ```


### TODO
 - Code Cleanup
 - Websockets
 - Share only with company
 - Mobile Phone verification
 - Setup oatuh using react-native-app-auth