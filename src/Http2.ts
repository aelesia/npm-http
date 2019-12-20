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
	Authorization = 'Authorization',
	UserAgent = 'User-Agent'
}

type Request = {
	body: object
	headers: object
	params: object
	url: string
	path: string
	body_type: Body
	oauth_token: OAuth2Token | null
	axios: AxiosInstance
}

const myaxios = axios.create()

export default class Http {

	private readonly req: Readonly<Request>

	constructor(req?: Request) {
		if (req) {
			this.req = req
		} else {
			this.req = {
				url: '',
				path: '',
				body: {},
				params: {},
				headers: {},

				body_type: Body.NONE,
				oauth_token: null,

				axios: myaxios
			}
		}
	}

	static axios(axios: AxiosInstance): Http {
		return new Http({
			url: '',
			path: '',
			body: {},
			params: {},
			headers: {},

			body_type: Body.NONE,
			oauth_token: null,
			axios
		})
	}

	static url(url: string): Http {
		return new Http({
			url: url,
			path: '',
			body: {},
			params: {},
			headers: {},

			body_type: Body.NONE,
			oauth_token: null,
			axios: myaxios
		})
	}

	url(url: string): Http {
		let req = {...this.req}
		req.url = url
		return new Http(req)
	}

	path(path: string): Http {
		let req = {...this.req}
		req.path = path
		return new Http(req)
	}

	cookie(cookie: string): Http {
		let req = {...this.req}
		req.headers = {...{}, ...this.req.headers, ...{[H.Cookie]:cookie}}
		return new Http(req)
	}

	user_agent(user_agent: string): Http {
		let req = {...this.req}
		req.headers = {...{}, ...this.req.headers, ...{[H.UserAgent]:user_agent}}
		return new Http(req)
	}

	header(key: H | string, value: string): Http {
		let req = {...this.req}
		req.headers = {...{}, ...this.req.headers, ...{[key]:value}}
		return new Http(req)
	}

	headers(headers: object): Http {
		let req = {...this.req}
		req.headers = {...{}, ...this.req.headers, ...headers}
		return new Http(req)
	}

	param(key: string, value: string): Http {
		let req = {...this.req}
		req.params = {...{}, ...this.req.params, ...{[key]:value}}
		return new Http(req)
	}

	params<Form extends object>(params: Form): Http {
		let req = {...this.req}
		req.params = {...{}, ...this.req.params, ...params}
		return new Http(req)
	}

	body_form(key: string, value: string): Http {
		let req = {...this.req}
		req.body_type = Body.FORM
		req.headers = Object.assign(this.req.headers, {[H.ContentType]:'application/x-www-form-urlencoded'})
		req.body = Object.assign(this.req.body, {[key]:value})
		return new Http(req)
	}

	body_forms<Form extends object>(body: Form): Http {
		let req = {...this.req}
		req.body_type = Body.FORM
		req.headers = Object.assign(this.req.headers, {[H.ContentType]:'application/x-www-form-urlencoded'})
		req.body = Object.assign(this.req.body, body)
		return new Http(req)
	}

	body_json_(key: string, value: string): Http {
		let req = {...this.req}
		req.body_type = Body.JSON
		// req._headers =
		throw new Error('Not Implemented Yet')
		req.body = Object.assign(this.req.body, {[key]:value})
		return new Http(req)
	}

	body_json<Form extends object>(body: Form): Http {
		let req = {...this.req}
		req.body_type = Body.JSON
		// req._headers =
		throw new Error('Not Implemented Yet')
		req.body = Object.assign(this.req.body, body)
		return new Http(req)
	}

	auth_basic(username: string, password: string): Http {
		let req = {...this.req}
		// req.auth_type = Auth.BASIC
		const hash = Buffer.from(username + ':' + password).toString('base64')
		req.headers = Object.assign(this.req.headers, {[H.Authorization]: `Basic ${hash}`})
		return new Http(req)
	}

	auth_bearer(token: string): Http {
		let req = {...this.req}
		// req.auth_type = Auth.BEARER
		req.headers = Object.assign(this.req.headers, {[H.Authorization]: `Bearer ${token}`})
		return new Http(req)
	}

	auth_oauth2_password(token: OAuth2Token): Http {
		let req = {...this.req}
		req.oauth_token = token
		return new Http(req)
	}

	async get<Resp>(): Promise<AxiosResponse<Resp>> {
		let req = {...this.req}
		if (req.body_type != Body.NONE) {
			throw Error('Body is not allowed for GET')
		}
		if (req.oauth_token) {
			let token = await req.oauth_token.async_access_token()
			req.headers = Object.assign(this.req.headers, {[H.Authorization]: `Bearer ${token}`})
		}

		return myaxios.get<Resp>(req.url + req.path,
			{ params: req.params, headers: req.headers })
	}

	async post<Resp>(): Promise<AxiosResponse<Resp>> {
		let req = {...this.req}
		let body
		switch(req.body_type) {
			case Body.FORM:
				// @ts-ignore
				body = qs.stringify(req.body)
				break
			case Body.JSON: body = req.body
				break
			case Body.NONE: body = {}
				break
		}
		if (req.oauth_token) {
			let token = await req.oauth_token.async_access_token()
			req.headers = Object.assign(this.req.headers, {[H.Authorization]: `Bearer ${token}`})
		}

		return myaxios.post(req.url + req.path,
			body,
			{ headers: req.headers })
	}
}

// DONE: Immutable HTTP classes
// DONE: Immutable objects
// TODO: Hard casting of object
