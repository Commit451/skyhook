## Resources available in a provider class  
`this.req` - whole HTTP request object ([Reference](http://expressjs.com/de/4x/api.html#req))  
`this.body` - only the body of the request object  
`this.payload` - a object of `util\DiscordPayload`

## Example for providers without multiple methods
```js
// {provider}.js
// {link to the documentation of the provider}
// ========
const BaseProvider = require('../util/BaseProvider');

class {provider} extends BaseProvider {
    async parseData() {
        //do your stuff here and add things to this.payload
    }
}
```

## Example for providers with multiple methods
```js
// {provider}.js
// {link to the documentation of the provider}
// ========
const BaseProvider = require('../util/BaseProvider');

class {provider} extends BaseProvider {
    constructor(){
        super();
        //do some stuff that should be available on all sub methods (e.g. setting the discord embed color)
    }

    async getType(){
        //return the method that is used for this request.
        //e.g. for GitLab we returning `this.body.object_kind`  
        //if this.body.object_kind would be merge_request it would execute the sub method mergeRequest in this class here.
        return {providerType};
    }

    //every type will be formated as camelCase
    //e.g. merge_request will be mergeRequest
    async {typeName}() {
        //do your stuff here and add things to this.payload
    }
}
```