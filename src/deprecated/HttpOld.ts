import axios, {AxiosError, AxiosInstance, AxiosPromise, AxiosResponse} from 'axios'
import qs from 'querystring'
import {OAuth2Token} from '../Token'

enum Auth {
	NONE,
	BASIC,
	BEARER,
	AWS,
	OAUTH2_PASSWORD,
}

enum Body {
	NONE,
	FORM,
	JSON
}


export enum H {
	Cookie = 'Cookie',
	ContentType = 'Content-Type',
	Authorization = 'Authorization'
}

const myaxios = axios.create()

export default class Http {

	private _url: string
	private _headers: object = {}
	private _params: object = {}
	private _body: object = {}

	private _auth_type: Auth = Auth.NONE
	private _body_type: Body = Body.NONE
	private _oauth_token: OAuth2Token | null = null
	public axios: AxiosInstance = myaxios

	private constructor(url: string) {
		this._url = url
	}

	static url(url: string, axios_instance?: AxiosInstance): Http {
		let http =  new Http(url)
		if (axios_instance) {
			http.axios = axios_instance
		}
		return http
	}

	private clone(): Http {
		let http = new Http(this._url)
		http._headers = this._headers
		http._params = this._params
		http._body = this._body
		http._auth_type = this._auth_type
		http._body_type = this._body_type
		http._oauth_token = this._oauth_token
		http.axios = this.axios
		return http
	}

	url(url: string): Http {
		this._url = url
		return this
	}

	private set _content_type(body: Body) {
		switch (body) {
			case Body.FORM: this._headers = {...{}, ...this._headers, ...{[H.ContentType]:'application/x-www-form-urlencoded'}}
				break
			case Body.JSON: throw Error('NotImplementedException')
		}
	}

	cookie(cookie: string): Http {
		let http = this.clone()
		http._headers = {...{}, ...http._headers, ...{[H.Cookie]:cookie}}
		return http
	}

	header(key: H | string, value: string): Http {
		let http = this.clone()
		http._headers = {...{}, ...http._headers, ...{[key]:value}}
		return http
	}

	headers(headers: object): Http {
		let http = this.clone()
		http._headers = {...{}, ...http._headers, ...headers}
		return http
	}

	param(key: string, value: string): Http {
		let http = this.clone()
		http._params = {...{}, ...http._params, ...{[key]:value}}
		return http
	}

	params<Form extends object>(params: Form): Http {
		let http = this.clone()
		http._params = {...{}, ...http._params, ...params}
		return http
	}

	body_form(key: string, value: string): Http {
		let http = this.clone()
		http._body_type = Body.FORM
		http._content_type = Body.FORM
		http._body = {...{}, ...http._body, ...{[key]:value}}
		return http
	}

	body_forms<Form extends object>(body: Form): Http {
		let http = this.clone()
		http._body_type = Body.FORM
		http._content_type = Body.FORM
		http._body = {...{}, ...http._body, ...body}
		return http
	}

	body_json_(key: string, value: string): Http {
		let http = this.clone()
		http._body_type = Body.JSON
		http._content_type = Body.JSON
		http._body = {...{}, ...http._body, ...{[key]:value}}
		return http
	}

	body_json<Form extends object>(body: Form): Http {
		let http = this.clone()
		http._body_type = Body.JSON
		http._content_type = Body.JSON
		http._body = {...{}, ...http._body, ...body}
		return http
	}

	auth_basic(username: string, password: string): Http {
		let http = this.clone()
		http._auth_type = Auth.BASIC
		const hash = Buffer.from(username + ':' + password).toString('base64')
		return http.header(H.Authorization, `Basic ${hash}`)
		// TODO: Doesn't conform
	}

	auth_bearer(token: string): Http {
		let http = this.clone()
		http._auth_type = Auth.BEARER
		return http.header(H.Authorization, `Bearer ${token}`)
		// TODO: Doesn't conform
	}

	auth_oauth2_password(token: OAuth2Token): Http {
		let http = this.clone()
		http._auth_type = Auth.OAUTH2_PASSWORD
		http._oauth_token = token
		return http
	}

	// get<Resp>(): AxiosPromise<Resp> {
	// 	if (this._body_type != Body.NONE) {
	// 		throw Error('Body is not allowed for GET')
	// 	}
	//
	// 	return myaxios.get(this._url,
	// 		{ params: this._params, headers: this._headers })
	// }

	async get<Resp>(): Promise<AxiosResponse<Resp>> {
		let http = this.clone()
		if (http._body_type != Body.NONE) {
			throw Error('Body is not allowed for GET')
		}
		if (http._oauth_token) {
			http = http.auth_bearer(await http._oauth_token.async_access_token())
		}

		return myaxios.get<Resp>(http._url,
			{ params: http._params, headers: http._headers })
	}

	async post<Resp>(): Promise<AxiosResponse<Resp>> {
		let http = this.clone()
		let body
		switch(this._body_type) {
			case Body.FORM:
				// @ts-ignore
				body = qs.stringify(this._body)
				break
			case Body.JSON: body = this._body
				break
			case Body.NONE: body = {}
				break
		}

		if (http._oauth_token) {
			http = http.auth_bearer(await http._oauth_token.async_access_token())
		}

		return myaxios.post(http._url,
			body,
			{ headers: http._headers })
	}

	static before(func: (config: any)=>any) {
		myaxios.interceptors.request.use(function (config: any) {
			func(config)
			return config
		}, function (e: Error) {
			return Promise.reject(e)
		})
	}

	static after(func: (response: any)=>any) {
		myaxios.interceptors.response.use(function (response: any) {
			func(response)
			return response
		}, function (e: Error) {
			return Promise.reject(e)
		})
	}
}

// DONE: Immutable HTTP classes
// DONE: Immutable objects
// TODO: .data(), .status_code(), .response()
// TODO: Hard casting of object
