## Resources available in a provider class  
`this.headers` - The headers of the request ([Reference](http://expressjs.com/de/4x/api.html#req))  
`this.body` - only the body of the request object  
`this.payload` - a [DiscordPayload](util/DiscordPayload.md)  
`this.logger` - a [winston](https://github.com/winstonjs/winston) logger.

## Example for providers without multiple methods
```ts
import { BaseProvider } from '../provider/BaseProvider'

class NewProvider extends BaseProvider {
    static getName() {
        return "{providerName}"
    }
    
    async parseData() {
        //do your stuff here and add things to this.payload
    }
}

export { NewProvider }

```

## Example for providers with multiple methods
```ts
import { BaseProvider } from '../provider/BaseProvider'

class NewProvider extends BaseProvider {
    constructor() {
        super()
        //do some stuff that should be available on all sub methods (e.g. setting the discord embed color)
    }
    
    public static getName() {
        return "{providerName}"
    }

    public getType() {
        //return the method that is used for this request.
        //e.g. for GitLab we returning `this.body.object_kind`  
        //if this.body.object_kind would be merge_request it would execute the sub method mergeRequest in this class here.
        return {providerType};
    }

    //every type will be formated as camelCase
    //e.g. merge_request will be mergeRequest
    public async {typeName}() {
        //do your stuff here and add things to this.payload
    }
}

export { NewProvider }

```
