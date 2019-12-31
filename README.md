# GET

    Http.url('https://www.reddit.com/r/singapore.json')
    .get<ForumInfo>()
    .then((data)=>{
        let a = data.data
        console.log(a.kind)
        a.data.children.forEach(({data})=>{
            console.log(data.id)
            console.log(data.title)
            console.log(data.author)
            console.log(data.url)
        })
    })

# POST

    Http.url('https://something.com')
        .post<Generic>()


# Authorization

## Basic
    Http.url('')
        .auth_basic('username', 'password')

## Bearer
    Http.url('')
        .auth_bearer('token')


# Headers

## Indivdual
    Http.url('')
        .header('header1', 'value1')
        .header('header2', 'value2')
        .header('header3', 'value3')

## JSON
    Http.url('')
        .headers({
            header1: 'value1',
            header2: 'value2',
            header3: 'value3'
        })

# Params

## Individual

    Http.url('')
        .param('param1', 'value1')
        .param('param2', 'value2')
        .param('param3', 'value3')

## JSON
    Http.url('')
        .params({
            param1: 'value1',
            param2: 'value2',
            param3: 'value3'
        })

# Body (Form)

## Individual
    Http.url('')
        .body_form('key1','value1')
        .body_form('key2','value2')
        .body_form('key3','value3')

## JSON
    Http.url('')
        .body_forms({
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
        })

# Body (JSON)

## Individual        
    Http.url('')
        .body_json_('key1','value1')
        .body_json_('key2','value2')
        .body_json_('key3','value3')

## JSON
    Http.url('')
        .body_json({
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
        })

# Pipe logs

    import {Log as HttpLog} from '@aelesia/http'
    
    HttpLog.stream = (log) => { console.info(log) }
