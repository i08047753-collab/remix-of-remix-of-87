import { describe,expect,it } from 'vitest';
import { contentSchema,validateFileMetadata,validateFileBytes,MAX_FILE_BYTES,MAX_ATTACHMENTS,SUBMISSION_INTERVAL_SECONDS,FAILED_CODE_LIMIT,CODE_WINDOW_SECONDS } from '@/lib/publishing-rules';
import { matchesPublishingCode } from '@/lib/publishing-security.server';
describe('publishing safeguards',()=>{
 it('only accepts the configured server secret',()=>{expect(matchesPublishingCode('test-only-token','test-only-token')).toBe(true);expect(matchesPublishingCode('wrong','test-only-token')).toBe(false);expect(matchesPublishingCode('test-only-token',undefined)).toBe(false);});
 it('uses the approved one-minute submission limit',()=>{expect(SUBMISSION_INTERVAL_SECONDS).toBe(60);});
 it('uses five failed checks per fifteen minutes',()=>{expect(FAILED_CODE_LIMIT).toBe(5);expect(CODE_WINDOW_SECONDS).toBe(900);});
 it('rejects oversized files',()=>{expect(MAX_FILE_BYTES).toBe(5242880);expect(validateFileMetadata({name:'image.png',type:'image/png',size:5242881})).not.toBeNull();expect(validateFileMetadata({name:'image.png',type:'image/png',size:5242880})).toBeNull();expect(MAX_ATTACHMENTS).toBe(3);});
 it('rejects active formats and mismatched MIME types',()=>{expect(validateFileMetadata({name:'image.svg',type:'image/svg+xml',size:100})).not.toBeNull();expect(validateFileMetadata({name:'image.png',type:'application/pdf',size:100})).not.toBeNull();});
 it('verifies file signatures and blocks active PDF actions',()=>{expect(validateFileBytes(new TextEncoder().encode('<script>bad</script>'),'image/png')).toBe(false);expect(validateFileBytes(new TextEncoder().encode('%PDF-1.7\n/JavaScript\n%%EOF'),'application/pdf')).toBe(false);expect(validateFileBytes(new TextEncoder().encode('%PDF-1.7\n%%EOF'),'application/pdf')).toBe(true);});
 it('validates post and article limits without accepting status or owner input',()=>{const base={kind:'article',title:'عنوان طويل',body:'a'.repeat(20000),category:'physics',intent:'answer',status:'published',owner_id:'forged'};const result=contentSchema.parse(base);expect('status' in result).toBe(false);expect('owner_id' in result).toBe(false);expect(contentSchema.safeParse({...base,body:'a'.repeat(20001)}).success).toBe(false);expect(contentSchema.safeParse({...base,kind:'post',body:'a'.repeat(2001)}).success).toBe(false);});
});
import { MAX_VIDEO_BYTES } from '@/lib/publishing-rules';
describe('video attachments',()=>{
 it('accepts MP4/WebM up to 20 MB and images stay at 5 MB',()=>{expect(MAX_VIDEO_BYTES).toBe(20971520);expect(validateFileMetadata({name:'v.mp4',type:'video/mp4',size:20971520})).toBeNull();expect(validateFileMetadata({name:'v.webm',type:'video/webm',size:20971521})).not.toBeNull();expect(validateFileMetadata({name:'i.png',type:'image/png',size:6000000})).not.toBeNull();});
 it('checks MP4 signature',()=>{const b=new Uint8Array(32);b.set(new TextEncoder().encode('ftypisom'),4);expect(validateFileBytes(b,'video/mp4')).toBe(true);expect(validateFileBytes(new Uint8Array(32),'video/mp4')).toBe(false);});
});
