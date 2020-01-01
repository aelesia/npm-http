import Http from './Http'
import {rethrow} from './Control'
import {DateUtil, StringUtil} from '@aelesia/commons'
import Log from './Log'

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
		Log.info('[OAuth2Token] Refreshing Token')
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

		this.token = {...data, ...{expires_on: DateUtil.add(data.expires_in * 1000)}}

	} catch(e) {
		//@ts-ignore
		rethrow(new Error('Unable to obtain O2A token'), e)
	}}

	async async_access_token(): Promise<string> {
		if (!this.token) {
			Log.info('No token')
			await this.refresh_token()
		}
		else if (DateUtil.has_passed(this.token.expires_on)) {
			Log.info('Token expired')
			await this.refresh_token()
		}
		else if (DateUtil.elapsed(this.token.expires_on) > this.token.expires_in*0.9) {
			Log.info('Token expiring soon')
			this.refresh_token()
				.then(()=>{})
				.catch(()=>{})
		}
		return this.token.access_token
	}
}
