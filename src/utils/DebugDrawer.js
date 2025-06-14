export default class DebugDrawer {
    set color(v) {
        this._currentColor = v;
        this._color.set(v)
    }    
    get color() {
        return this._currentColor
    }
    constructor({THREE,count=100000}) {
        let {sin, cos, PI, max, min, abs} = Math;
        let vec3 = (x,y,z)=>new THREE.Vector3(x,y,z)
        let v1 = vec3()
        let v2 = vec3()
        let cursor = vec3()
        this._color = new THREE.Color('white');
        let material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            vertexColors: true,
            toneMapped: false,
            
            //opacity:.2,
            transparent:true,
            blending:THREE.AdditiveBlending
        });
        this.lines = new THREE.LineSegments(new THREE.BufferGeometry(),material);
        this.lines.frustumCulled = false;
        let geometry = this.geometry = this.lines.geometry;
        let points = new THREE.BufferAttribute(new Float32Array(count*3),3).setUsage(THREE.DynamicDrawUsage)
        let colors = new THREE.BufferAttribute(new Float32Array(count*3),3).setUsage(THREE.DynamicDrawUsage)
        geometry.setAttribute('position', points)
        geometry.setAttribute('color', colors)
        let top = 0;
        let lastVersion=0;
        let version=0;
        this.lines.onBeforeRender=()=>{
            if(version==lastVersion)return
            geometry.setDrawRange(0, top>points.count ? Infinity : top)
            points.needsUpdate = true;
            colors.needsUpdate = true;
            lastVersion = version;
        }
        this.lineCol=(c=this._color,scl=1)=>{
            let r=c.r*scl;
            let g=c.g*scl;
            let b=c.b*scl;
            colors.setXYZ(top%points.count, r,g,b)
            top++;
            colors.setXYZ(top%points.count, r,g,b)
            top++;
            version++;
        }
        let vt = (p,c=this._color)=>{
            points.setXYZ(top%points.count, p.x, p.y, p.z)
            colors.setXYZ(top%points.count, c.r, c.g, c.b)
            top++;
        }
        let stack=[]
        this.poptop=()=>top=stack.pop();
        this.pushtop=(ntop)=>{
            stack.push(top);
            top=ntop;
        }
        this.top = ()=>top%points.count;
        let moveto = this.moveto = (p,d,q)=>((d !== undefined) && cursor.set(p, d, q)) || cursor.copy(p)
        let lineto = this.lineto = (p,d,q)=>{
            vt(cursor);
            moveto(p, d, q);
            vt(cursor);
            version++;
        }
        this.cls = ()=>{
            top = 0;
            version++;
        }
        this.circle = (radius=.1,sides=16)=>{
            v2.copy(cursor)
            for (let i = 0; i <= sides; i++) {
                v1.copy(v2);
                let th = i * PI * 2 / sides
                v1.x += sin(th) * radius
                v1.z += cos(th) * radius
                if (!i)
                    moveto(v1);
                else
                    lineto(v1);
            }
            cursor.copy(v2);
        }
        {   
            let n = vec3()
            let p = vec3()
            this.aabox=(x=0,y=0,z=0,sx=.5,sy=sx,sz=sx)=>{
                n.set( x-sx,y-sy,z-sz);
                p.set( x+sx,y+sy,z+sz);
         
                moveto(n.x,n.y,n.z);
                lineto(p.x,n.y,n.z);
                lineto(p.x,p.y,n.z);
                lineto(n.x,p.y,n.z);
                lineto(n.x,n.y,n.z);
                
                moveto(n.x,n.y,p.z);
                lineto(p.x,n.y,p.z);
                lineto(p.x,p.y,p.z);
                lineto(n.x,p.y,p.z);
                lineto(n.x,n.y,p.z);

                moveto(p.x,n.y,n.z);
                lineto(p.x,n.y,p.z); 
                
                moveto(n.x,p.y,n.z);
                lineto(n.x,p.y,p.z);
                
                moveto(p.x,p.y,n.z);
                lineto(p.x,p.y,p.z); 
                
                moveto(n.x,n.y,n.z);
                lineto(n.x,n.y,p.z);
            }
        }
    }
}
