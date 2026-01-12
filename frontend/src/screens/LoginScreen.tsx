import { colors } from '../theme/colors';

// ... (imports remain the same)

export default function LoginScreen({ navigation }: any) {
    // ... (logic remains the same)

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>Conectando corações, construindo futuros</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Entrar</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotButton}>
                <Text style={styles.forgotButtonText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerButtonText}>Criar Conta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.background },
    logo: { width: '100%', height: 120, marginBottom: 10 },
    tagline: { fontSize: 14, color: colors.secondary, textAlign: 'center', marginBottom: 30, fontStyle: 'italic' },
    input: { width: '100%', height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, backgroundColor: colors.white, fontSize: 16, color: colors.text },
    loginButton: { width: '100%', height: 50, backgroundColor: colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 2 },
    registerButton: { width: '100%', height: 50, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
    registerButtonText: { color: colors.primary, fontSize: 18, fontWeight: 'bold' },
    forgotButton: { marginBottom: 20, alignItems: 'center' },
    forgotButtonText: { color: colors.textLight, fontSize: 16 }
});
