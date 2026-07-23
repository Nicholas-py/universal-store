import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/** A Durable Object's behavior is defined in an exported Javascript class */
export class UniversalStore extends DurableObject<Env> {
	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 */
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	/**
	 * The Durable Object exposes an RPC method sayHello which will be invoked when a Durable
	 *  Object instance receives a request from a Worker via the same method invocation on the stub
	 *
	 * @param name - The name provided to a Durable Object instance from a Worker
	 * @returns The greeting to be sent back to the Worker
	 */
	async sayHello(name: string): Promise<string> {
		if (name != "store") {
			return `Hello, ${name}!`;
		}
		else {
			return `Uh. TBD. BRB.`
		}
	}

	async getFullStore(): Promise<string> {
		let val = await this.ctx.storage.get("store_data") as string;
		return val;
	}

	async setValues(vals:any) {
		let internalstate = JSON.parse(await this.getFullStore());
		Object.keys(vals).forEach( (key:string) => {
			internalstate[key] = vals[key]
		})
		let internalstring = JSON.stringify(internalstate);
		await this.ctx.storage.put("store_data",internalstring);
	}
}

export default class extends WorkerEntrypoint<Env> {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */

	private stub() {
		return this.env.UNIVERSAL_STORE.getByName("store");
	}

	private getStore() {
		return this.stub().getFullStore();
	}

	private setValues(vals:any) {
		return this.stub().setValues(vals);
	}

	async fetch(request: Request): Promise<Response> {
		const json = await this.stub().getFullStore();
		return new Response(JSON.stringify(json));
	}

}
