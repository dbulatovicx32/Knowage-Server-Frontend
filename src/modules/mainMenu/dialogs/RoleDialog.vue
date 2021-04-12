<template>
	<Dialog class="kn-dialog--toolbar--primary RoleDialog" v-bind:visible="visibility" footer="footer" :header="$t('role.roleSelection')" :closable="false" modal>
		<Dropdown id="role" v-model="sessionRole" class="kn-material-input" @change="setDirty" :options="roles" :placeholder="$t('role.defaultRolePlaceholder')" />
		<template #footer>
			<Button class="p-button-text kn-button" v-t="'common.close'" @click="closeDialog" />
			<Button class="kn-button kn-button--primary" v-t="'common.save'" @click="changeRole" />
		</template>
	</Dialog>
</template>

<script lang="ts">
	import { defineComponent } from 'vue'
	import Dialog from 'primevue/dialog'
	import Dropdown from 'primevue/dropdown'
	import axios from 'axios'

	export default defineComponent({
		name: 'role-dialog',
		components: {
			Dialog,
			Dropdown
		},
		data() {
			return {
				/* roles: Array<Role>() */
				roles: ['', 'admin', 'Audit', 'user'],
				sessionRole: ''
			}
		},
		created() {},
		props: {
			visibility: Boolean
		},
		emits: ['update:visibility'],
		methods: {
			formUrlEncoded(x) {
				return Object.keys(x)
					.reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')
					.substring(1)
			},

			changeRole() {
				let headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
				let data = this.formUrlEncoded({ ACTION_NAME: 'SET_SESSION_ROLE_ACTION', SELECTED_ROLE: this.sessionRole })
				let postUrl = '/knowage/servlet/AdapterHTTP'
				axios
					.post(postUrl, data, { headers: headers })
					.then(() => {
						this.closeDialog()
						this.$router.go(0)
					})
					.catch((error) => console.error(error))
			},
			closeDialog() {
				this.$emit('update:visibility', false)
			}
		}
	})
</script>

<style scoped lang="scss">
	.p-dialog {
		.p-dropdown {
			margin: 10px 0 0 0;
		}
	}
	.RoleDialog #role {
		width: 300px;
	}
</style>