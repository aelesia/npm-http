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
	_body: object
	_headers: object
	_params: object
	_url: string
	_auth_type: Auth
	_body_type: Body
	_oauth_token: OAuth2Token | null
}

const myaxios = axios.create()

export default class Http {

	private config: Readonly<Request>

	private constructor(config?: Request) {
		if (config) {
			this.config = config
		} else {
			this.config = {
				_url: '',
				_body: {},
				_params: {},
				_headers: {},

				_auth_type: Auth.NONE,
				_body_type: Body.NONE,
				_oauth_token: null,
			}
		}
	}

	url(url: string): Http {
		let config = {...this.config}
		config._url = url
		return new Http(config)
	}

	header(key: H | string, value: string): Http {
		let config = {...this.config}
		config._headers = {...{}, ...this.config._headers, ...{[key]:value}}
		return new Http(config)
	}

	headers(headers: object): Http {
		let config = {...this.config}
		config._headers = {...{}, ...this.config._headers, ...headers}
		return new Http(config)
	}

	param(key: string, value: string): Http {
		let config = {...this.config}
		config._params = {...{}, ...this.config._params, ...{[key]:value}}
		return new Http(config)
	}

	params<Form extends object>(params: Form): Http {
		let config = {...this.config}
		config._params = {...{}, ...this.config._params, ...params}
		return new Http(config)
	}

	body_form(key: string, value: string): Http {
		let config = {...this.config}
		config._body_type = Body.FORM
		config._headers = Object.assign(this.config._headers, {[H.ContentType]:'application/x-www-form-urlencoded'})
		config._body = Object.assign(this.config._body, {[key]:value})
		return new Http(config)
	}

	body_forms<Form extends object>(body: Form): Http {
		let config = {...this.config}
		config._body_type = Body.FORM
		config._headers = Object.assign(this.config._headers, {[H.ContentType]:'application/x-www-form-urlencoded'})
		config._body = Object.assign(this.config._body, body)
		return new Http(config)
	}

	body_json_(key: string, value: string): Http {
		let config = {...this.config}
		config._body_type = Body.JSON
		// config._headers =
		throw new Error('Not Implemented Yet')
		config._body = Object.assign(this.config._body, {[key]:value})
		return new Http(config)
	}

	body_json<Form extends object>(body: Form): Http {
		let config = {...this.config}
		config._body_type = Body.JSON
		// config._headers =
		throw new Error('Not Implemented Yet')
		config._body = Object.assign(this.config._body, body)
		return new Http(config)
	}

	auth_basic(username: string, password: string): Http {
		let config = {...this.config}
		config._auth_type = Auth.BASIC
		const hash = Buffer.from(username + ':' + password).toString('base64')
		config._headers = Object.assign(this.config._headers, {[H.Authorization]: `Basic ${hash}`})
		return new Http(config)
	}

	auth_bearer(token: string): Http {
		let config = {...this.config}
		config._auth_type = Auth.BEARER
		config._headers = Object.assign(this.config._headers, {[H.Authorization]: `Bearer ${token}`})
		return new Http(config)
	}

	auth_oauth2_password(token: OAuth2Token): Http {
		let config = {...this.config}
		config._auth_type = Auth.OAUTH2_PASSWORD
		config._oauth_token = token
		return new Http(config)
	}

	async get<Resp>(): Promise<AxiosResponse<Resp>> {
		let config = {...this.config}
		if (config._body_type != Body.NONE) {
			throw Error('Body is not allowed for GET')
		}
		if (config._oauth_token) {
			let token = await config._oauth_token.async_access_token()
			config._headers = Object.assign(this.config._headers, {[H.Authorization]: `Bearer ${token}`})
		}

		return myaxios.get<Resp>(config._url,
			{ params: config._params, headers: config._headers })
	}

	async post<Resp>(): Promise<AxiosResponse<Resp>> {
		let config = {...this.config}
		let body
		switch(config._body_type) {
			case Body.FORM:
				// @ts-ignore
				body = qs.stringify(config._body)
				break
			case Body.JSON: body = config._body
				break
			case Body.NONE: body = {}
				break
		}
		if (config._oauth_token) {
			let token = await config._oauth_token.async_access_token()
			config._headers = Object.assign(this.config._headers, {[H.Authorization]: `Bearer ${token}`})
		}

		return myaxios.post(config._url,
			body,
			{ headers: config._headers })
	}
}

// DONE: Immutable HTTP classes
// DONE: Immutable objects
// TODO: .data(), .status_code(), .response()
// TODO: Hard casting of object
