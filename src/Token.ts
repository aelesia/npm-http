import Http from './Http'
import {Time} from './Time'
import {rethrow} from './Control'

type Token = {
	access_token:  string;
	token_type:    string;
	expires_in:    number;
	refresh_token?: string;
	scope?:         string;
}

type GrantPassword = {
	access_token_url: string,
	username: string,
	password: string,
	client_id: string,
	client_secret: string,
	scope?: string
}

export class OAuth2Token{

	private token: Token & {expires_on: Date} = null as any
	private config: GrantPassword

	constructor(config: GrantPassword) {
		this.config = config
	}

	async init(): Promise<void> {
		await this.refresh_token()
	}

	// FIXME: Shouldn't be void function
	async refresh_token(): Promise<void> { try {
		console.log('[OAuth2Token] Refreshing Token')
		let data = (await Http.url(this.config.access_token_url)
			.auth_basic(this.config.client_id, this.config.client_secret)
			.body_forms({
				grant_type: 'password',
				username: this.config.username,
				password: this.config.password
			})
			.post<Token>())
			.data

		if (!data.access_token || !data.token_type || !data.expires_in) {
			throw Error(`Invalid token - ${JSON.stringify(data)}`)
		}

		this.token = {...data, ...{expires_on: Time.add(data.expires_in)}}

	} catch(e) {
		//@ts-ignore
		rethrow(new Error('Unable to obtain O2A token'), e)
	}}

	async async_access_token(): Promise<string> {
		if (!this.token) {
			console.log('No token')
			await this.refresh_token()
		}
		else if (Time.is_after(this.token.expires_on)) {
			console.log('Token expired')
			await this.refresh_token()
		}
		else if (Time.elapsed(this.token.expires_on) > this.token.expires_in*0.9) {
			console.log('Token expiring soon')
			this.refresh_token()
				.then(()=>{})
				.catch(()=>{})
		}
		return this.token.access_token
	}

	// access_token(): string {
	// 	if (!this.token) {
	// 		this.refresh_token()
	// 		throw Error('Access token not yet initialized. Did you forget to call Token.init()?')
	// 	}
	//
	// 	if (Time.is_after(this.token.expires_on)) {
	// 		this.refresh_token()
	// 		throw Error('Access token has expired.')
	// 	} else if (Time.elapsed(this.token.expires_on) > this.token.expires_in*0.9) {
	// 		this.refresh_token()
	// 	}
	//
	// 	return this.token.access_token
	// }
}
