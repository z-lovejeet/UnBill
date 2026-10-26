// Compatibility entry point: run against an explicitly started test server.
import { spawnSync } from 'node:child_process';
const result=spawnSync('npm',['run','test:live'],{stdio:'inherit'});process.exitCode=result.status??1;
