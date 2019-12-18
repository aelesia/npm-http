import axios, {AxiosError, AxiosInstance, AxiosPromise, AxiosResponse} from 'axios'
import qs from 'querystring'
import {OAuth2Token} from './Token'

// TODO: Immutability
// TODO: Logging

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

type Request = {
	body: object
	headers: object
	params: object
	url: string
	path: string
	auth_type: Auth
	body_type: Body
	oauth_token: OAuth2Token | null
}

const myaxios = axios.create()

export default class Http {

	private config: Readonly<Request>

	private constructor(config?: Request) {
		if (config) {
			this.config = config
		} else {
			this.config = {
				url: '',
				path: '',
				body: {},
				params: {},
				headers: {},

				auth_type: Auth.NONE,
				body_type: Body.NONE,
				oauth_token: null,
			}
		}
	}

	url(url: string): Http {
		let config = {...this.config}
		config.url = url
		return new Http(config)
	}

	path(url: string): Http {
		let config = {...this.config}
		config.url = url
		return new Http(config)
	}

	header(key: H | string, value: string): Http {
		let config = {...this.config}
		config.headers = {...{}, ...this.config.headers, ...{[key]:value}}
		return new Http(config)
	}

	headers(headers: object): Http {
		let config = {...this.config}
		config.headers = {...{}, ...this.config.headers, ...headers}
		return new Http(config)
	}

	param(key: string, value: string): Http {
		let config = {...this.config}
		config.params = {...{}, ...this.config.params, ...{[key]:value}}
		return new Http(config)
	}

	params<Form extends object>(params: Form): Http {
		let config = {...this.config}
		config.params = {...{}, ...this.config.params, ...params}
		return new Http(config)
	}

	body_form(key: string, value: string): Http {
		let config = {...this.config}
		config.body_type = Body.FORM
		config.headers = Object.assign(this.config.headers, {[H.ContentType]:'application/x-www-form-urlencoded'})
		config.body = Object.assign(this.config.body, {[key]:value})
		return new Http(config)
	}

	body_forms<Form extends object>(body: Form): Http {
		let config = {...this.config}
		config.body_type = Body.FORM
		config.headers = Object.assign(this.config.headers, {[H.ContentType]:'application/x-www-form-urlencoded'})
		config.body = Object.assign(this.config.body, body)
		return new Http(config)
	}

	body_json_(key: string, value: string): Http {
		let config = {...this.config}
		config.body_type = Body.JSON
		// config._headers =
		throw new Error('Not Implemented Yet')
		config.body = Object.assign(this.config.body, {[key]:value})
		return new Http(config)
	}

	body_json<Form extends object>(body: Form): Http {
		let config = {...this.config}
		config.body_type = Body.JSON
		// config._headers =
		throw new Error('Not Implemented Yet')
		config.body = Object.assign(this.config.body, body)
		return new Http(config)
	}

	auth_basic(username: string, password: string): Http {
		let config = {...this.config}
		config.auth_type = Auth.BASIC
		const hash = Buffer.from(username + ':' + password).toString('base64')
		config.headers = Object.assign(this.config.headers, {[H.Authorization]: `Basic ${hash}`})
		return new Http(config)
	}

	auth_bearer(token: string): Http {
		let config = {...this.config}
		config.auth_type = Auth.BEARER
		config.headers = Object.assign(this.config.headers, {[H.Authorization]: `Bearer ${token}`})
		return new Http(config)
	}

	auth_oauth2_password(token: OAuth2Token): Http {
		let config = {...this.config}
		config.auth_type = Auth.OAUTH2_PASSWORD
		config.oauth_token = token
		return new Http(config)
	}

	async get<Resp>(): Promise<AxiosResponse<Resp>> {
		let config = {...this.config}
		if (config.body_type != Body.NONE) {
			throw Error('Body is not allowed for GET')
		}
		if (config.oauth_token) {
			let token = await config.oauth_token.async_access_token()
			config.headers = Object.assign(this.config.headers, {[H.Authorization]: `Bearer ${token}`})
		}

		return myaxios.get<Resp>(config.url,
			{ params: config.params, headers: config.headers })
	}

	async post<Resp>(): Promise<AxiosResponse<Resp>> {
		let config = {...this.config}
		let body
		switch(config.body_type) {
			case Body.FORM:
				// @ts-ignore
				body = qs.stringify(config.body)
				break
			case Body.JSON: body = config.body
				break
			case Body.NONE: body = {}
				break
		}
		if (config.oauth_token) {
			let token = await config.oauth_token.async_access_token()
			config.headers = Object.assign(this.config.headers, {[H.Authorization]: `Bearer ${token}`})
		}

		return myaxios.post(config.url,
			body,
			{ headers: config.headers })
	}
}

// DONE: Immutable HTTP classes
// DONE: Immutable objects
// TODO: .data(), .status_code(), .response()
// TODO: Hard casting of object
