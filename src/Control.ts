export function rethrow(e1: Error, e2: Error): void {
	// @ts-ignore
	e1.stack = e1.stack + '\n' + e2.stack
	throw e1
}
